import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { OrderInterface, OrderInterfaceToken } from './interface/order.interface';
import { OrderItemInterface, OrderItemInterfaceToken } from './interface/orderItem.interface';
import { OrderItem } from './entity/orderItem.entity';
import { ProductService } from '../product/product.service';
import { RedisService } from 'src/redis/redis.service';
import { ProductIngredient } from '../product/entity/productIngredient.entity';
import { QueueService } from 'src/bull/queue.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(OrderInterfaceToken) private readonly orderRepo: OrderInterface,
    @Inject(OrderItemInterfaceToken) private readonly orderItemRepo: OrderItemInterface,
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService
  ) {}

  async create(orderItems: Partial<OrderItem>[]) {
    const products = this.mapOrderItemsToProducts(orderItems);
    const productIngredients = await this.productService.findAll(Object.keys(products));
    const ingredientRequiredAmount = this.getIngredientRequiredAmount(productIngredients, products);
    const redisKeys = Object.keys(ingredientRequiredAmount);
    const acquiredLocks = await this.redisService.acquireLocks(redisKeys);
  
    try {
      const { updateRedisData, errors } = await this.processIngredients(ingredientRequiredAmount);
      if (errors.length > 0) {
        this.logger.error(`Order creation failed: ${errors}`);
        throw new BadRequestException(errors.join('\n'));
      }

      await this.updateRedisData(updateRedisData);
      const order = await this.orderRepo.create();
      await this.createOrderItems(order.id, orderItems);
      await this.enqueueUpdateJobs(updateRedisData);

      this.logger.log(`Sending notification as stock is cut by 50%...`);
      // TODO: send email notification
    } finally {
      await this.redisService.releaseLocks(acquiredLocks);
    }
  }

  private getIngredientRequiredAmount(
    productIngredients: ProductIngredient[],
    products: Record<string, number>
  ): Record<string, number> {
    return productIngredients.reduce((acc, ingredient) => {
      const requiredAmount = ingredient.amount * products[ingredient.product_id];
      acc[ingredient.ingredient_id] = (acc[ingredient.ingredient_id] || 0) + requiredAmount;
      return acc;
    }, {} as Record<string, number>);
  }

  private mapOrderItemsToProducts(orderItems: Partial<OrderItem>[]): Record<string, number> {
    return orderItems.reduce((acc, item) => {
      acc[item.product_id] = item.quantity;
      return acc;
    }, {} as Record<string, number>);
  }

  private async processIngredients(
    ingredientRequiredAmount: Record<string, number>
  ): Promise<{ updateRedisData: RedisData[], errors: string[] }> {
    const updateRedisData: RedisData[] = [];
    const errors: string[] = [];

    for (const [ingredientId, requiredAmount] of Object.entries(ingredientRequiredAmount)) {
      const redisKey = ingredientId;
      const redisValue = await this.redisService.getValue(redisKey);
      const { stock, availableStock, emailSent } = JSON.parse(redisValue);

      if (availableStock < requiredAmount) {
        errors.push(`Insufficient stock for ingredient ${ingredientId}: required ${requiredAmount}, available ${availableStock}.`);
      } else {
        const newAvailableStock = availableStock - requiredAmount;
        updateRedisData.push({
          redisKey,
          redisValue: JSON.stringify({ stock, availableStock: newAvailableStock, emailSent }),
          cutAmount: requiredAmount,
        });
      }
    }

    return { updateRedisData, errors };
  }

  private async updateRedisData(updateRedisData: RedisData[]) {
    this.logger.log('Updating Redis data...');
    await Promise.all(updateRedisData.map(data =>
      this.redisService.setValue(data.redisKey, data.redisValue)
    ));
  }

  private async createOrderItems(orderId: number, orderItems: Partial<OrderItem>[]) {
    await this.orderItemRepo.create(
      orderItems.map(item => ({ ...item, order_id: orderId }))
    );
  }

  private async enqueueUpdateJobs(updateRedisData: RedisData[]) {
    this.logger.log('Enqueuing jobs to update ingredients in PostgreSQL...');
    const jobs = updateRedisData.map(data => {
      const job = {
        where: { id: parseInt(data.redisKey) },
        data: { cutAmount: data.cutAmount },
        action: 'update ingredients',
        jobID: Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000,
      };
      return this.queueService.addJob(job);
    });
    await Promise.all(jobs);
  }
}

interface RedisData {
  redisKey: string;
  redisValue: string;
  cutAmount: number;
}
