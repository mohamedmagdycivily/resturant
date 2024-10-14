import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { OrderInterface, OrderInterfaceToken } from './interface/order.interface';
import { OrderItemInterface, OrderItemInterfaceToken } from './interface/orderItem.interface';
import { OrderItem } from './entity/orderItem.entity';
import { ProductService } from '../product/product.service';
import { RedisService } from 'src/redis/redis.service';
import { ProductIngredient } from '../product/entity/productIngredient.entity';
import { QueueService } from 'src/bull/queue.service';
import { ConfigService } from '@nestjs/config';
import { QueryRunner, DataSource } from 'typeorm';
import { IngredientService } from '../ingredient/ingredient.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(OrderInterfaceToken) private readonly orderRepo: OrderInterface,
    @Inject(OrderItemInterfaceToken) private readonly orderItemRepo: OrderItemInterface,
    private readonly productService: ProductService,
    private readonly ingredientService: IngredientService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource 
  ) {}

  async create(orderItems: Partial<OrderItem>[]) {
    const products = this.mapOrderItemsToProducts(orderItems);
    const productIngredients = await this.productService.findAllProductIngredients(Object.keys(products));
    const ingredientRequiredAmount = this.getIngredientRequiredAmount(productIngredients, products);
    const redisKeys = Object.keys(ingredientRequiredAmount);
    const acquiredLocks = await this.redisService.acquireLocks(redisKeys);
  
    try {
      const { updateRedisData, errors } = await this.processIngredients(ingredientRequiredAmount);
      // exit early if there are any errors
      this.handleOrderCreationErrors(errors); 

      // enqueue jobs for create order in psql and send notification
      await this.enqueueCreateOrderJobs(updateRedisData, orderItems);
      await this.enqueueNotificationJobs(updateRedisData);

      // update redis
      await this.updateRedisDataInTransaction(updateRedisData);

    } finally {
      await this.redisService.releaseLocks(acquiredLocks);
    }
  }

  private generateRandomJobID(): number {
    return Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
  }

  private async updateRedisDataInTransaction(updateRedisData: any[]) {
    this.logger.log('Updating Redis data...');
    const transaction = this.redisService.createTransaction(); // Start transaction
  
    // Queue all updates in the transaction
    for (const data of updateRedisData) {
      this.redisService.multiSetValue(transaction, data.redisKey, data.newRedisValue, data.expiry, data.isNonExpiring);
    }
  
    // Commit the transaction
    await this.redisService.commitTransaction(transaction);
  }

  private handleOrderCreationErrors(errors: string[]) {
    if (errors.length > 0) {
      this.logger.error(`Order creation failed: ${errors}`);
      throw new BadRequestException(errors.join('\n'));
    }
  }

  private getIngredientRequiredAmount(
    productIngredients: ProductIngredient[],
    products: Record<string, number>
  ): Record<string, {requiredAmount: number, name: string}> {
    const formatedProductIngredients = {};

    for (const ingredient of productIngredients) {
      const requiredAmount = ingredient.amount * products[ingredient.product_id];
      if(!formatedProductIngredients[ingredient.ingredient_id]) {
        formatedProductIngredients[ingredient.ingredient_id] = { requiredAmount,  name: ingredient.ingredient.name };
      }else{
        formatedProductIngredients[ingredient.ingredient_id].requiredAmount += requiredAmount
      }
    }

    return formatedProductIngredients;
  }

  private mapOrderItemsToProducts(orderItems: Partial<OrderItem>[]): Record<string, number> {
    return orderItems.reduce((acc, item) => {
      acc[item.product_id] = item.quantity;
      return acc;
    }, {} as Record<string, number>);
  }

  private async processIngredients(
    ingredientRequiredAmount: Record<string, {requiredAmount: number, name: string}>
  ): Promise<{ updateRedisData: RedisData[], errors: string[] }> {
    const updateRedisData: RedisData[] = [];
    const errors: string[] = [];

    for (const ingredientId of Object.keys(ingredientRequiredAmount)) {
      const requiredAmount = ingredientRequiredAmount[ingredientId].requiredAmount;
      const ingredientName = ingredientRequiredAmount[ingredientId].name;
      const redisKey = ingredientId;
      const oldRedisValue = await this.redisService.getValue(redisKey);
      const { stock, availableStock, emailSent } = JSON.parse(oldRedisValue);

      if (availableStock < requiredAmount) {
        errors.push(`Insufficient stock for ingredient ${ingredientName}: required ${requiredAmount}, available ${availableStock}.`);
      } else {
        const newAvailableStock = availableStock - requiredAmount;
        const newEmailSent = newAvailableStock < stock * 0.5 ? true : emailSent;
        const sendEmail = !emailSent && newEmailSent ? true : false; 
        updateRedisData.push({
          redisKey,
          ingredientName,
          newRedisValue: JSON.stringify({ stock, availableStock: newAvailableStock, emailSent: newEmailSent }),
          cutAmount: requiredAmount,
          expiry: undefined,
          isNonExpiring: true,
          sendEmail,
        });
      }
    }

    return { updateRedisData, errors };
  }

  private async enqueueCreateOrderJobs(updateRedisData: RedisData [], orderItems: Partial<OrderItem>[]) {
    this.logger.log('Enqueuing jobs to update ingredients in PostgreSQL...');
    let job = {
      ingredients:[],
      orderItems,
      action: 'create order',
      jobID: this.generateRandomJobID(),
    };

    // Add ingredients to the job
    updateRedisData.forEach(data => {
      job.ingredients.push({
        where: { id: parseInt(data.redisKey) },
        data: { cutAmount: data.cutAmount },
      });
    });
    return this.queueService.addJob(job);
  }

  private async enqueueNotificationJobs(updateRedisData: RedisData[]) {
    this.logger.log('Enqueuing jobs to send notifications...');
    const jobs = updateRedisData
      .map(data => {
        // Send notification if stock is reduced by 50%
        if(data.sendEmail){
          this.logger.log(`Sending notification as stock is cut by 50%...`);
          const job = {
            to: this.configService.get<string>('NOTIFICATION_EMAIL'),
            subject: 'Stock Update',
            message: `${data.ingredientName} Stock Decreased by 50%`,
            type: 'email',
            action: 'send notification',
            jobID: this.generateRandomJobID(),
          };
          return this.queueService.addNotificationJob(job);
        }
      });
    await Promise.all(jobs);
  }
  async handleCreateOrderJob(data: { jobID: string, action: string, orderItems: Partial<OrderItem>[], ingredients: {where: string, data: {cutAmount: number}}[] }) {
    this.logger.log(`Processing jobID ${data.jobID} Action ${data.action}`);

    // Start a new transaction using QueryRunner
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order inside the transaction
      const order = await this.orderRepo.create({}, queryRunner.manager);

      // Create order items inside the transaction
      await this.orderItemRepo.create(
        data.orderItems.map(item => ({ ...item, order_id: order.id })),
        queryRunner.manager
      );

      // update product ingredients
      await Promise.all(data.ingredients.map(ingredient => this.ingredientService.update(ingredient, queryRunner.manager)));

      // Commit the transaction
      await queryRunner.commitTransaction();
      
    } catch (error) {
      // Rollback the transaction if anything goes wrong
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error processing jobID ${data.jobID} Action ${data.action}`, error.stack);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }

    this.logger.log(`Job done jobID ${data.jobID} Action ${data.action}`);
    return 1;
  }
  
}

interface RedisData {
  redisKey: string; // ingredientID
  ingredientName: string;
  newRedisValue: string;
  cutAmount: number;
  expiry: number | undefined;
  isNonExpiring: boolean;
  sendEmail: boolean; // to check if i should send email or not
}