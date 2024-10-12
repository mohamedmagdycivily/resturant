import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import {
  OrderInterface,
  OrderInterfaceToken,
} from './interface/order.interface';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
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
    @Inject(ProductService) private readonly productService: ProductService,
    @Inject(RedisService) private readonly redisService: RedisService,
    @Inject(QueueService) private readonly queueService: QueueService
  ) {}

  async create(orderItems: Partial<OrderItem>[]) {
    const products = this.mapOrderItemsToProducts(orderItems);
    const productIngredients = await this.productService.findAll(Object.keys(products));
    const ingredientRequiredAmount = this.getIngredientRequiredAmount(productIngredients, products);
    const redisKeys = Object.keys(ingredientRequiredAmount);
    const acquiredLocks = await this.redisService.acquireLocks(redisKeys);
  
    try {
      const { updateRedisData, errors } = await this.processIngredients(ingredientRequiredAmount, products);
      console.log('🌟🌟🌟 updateRedisData = ', updateRedisData);
      if (errors.length > 0) {
        this.logger.log(`create order errors: ${errors}`);
        throw new BadRequestException(errors.join("\n"));
      }
      
      // update redis stock with the new values
      await this.updateRedisData(updateRedisData);
      // create the order and the order items
      const order = await this.orderRepo.create();
      await this.orderItemRepo.create(
        orderItems.map(orderItem => ({
          ...orderItem,
          order_id: order.id,
        }))
      );
      
      this.logger.log(`create job to update ingredients in psql`);
      const jobs = [];
      updateRedisData.forEach(item => {
        const job = {
            where :{
              id: parseInt(item.redisKey),
            },
            data: {
              cutAmount: item.cutAmount,
            },
            action: 'update ingredients',
            jobID: Math.floor(Math.random() * (1000 - 100000 + 1)) + 100000,
          };
        jobs.push(this.queueService.addJob(job));
      });
      await Promise.all(jobs);

      this.logger.log(`sending mail as the amount is cut by 50% ...`);
      // TODO: send mail
    } finally {
      await this.redisService.releaseLocks(acquiredLocks);
    }
  }

  private getIngredientRequiredAmount(productIngredients: ProductIngredient[], products: Record<string, number>){
    const ingredientsRequiredAmount = {};
    for (const productIngredient of productIngredients) {
      if(!ingredientsRequiredAmount[productIngredient.ingredient_id]){
        ingredientsRequiredAmount[productIngredient.ingredient_id] = productIngredient.amount * products[productIngredient.product_id];
      }else{
        ingredientsRequiredAmount[productIngredient.ingredient_id] += productIngredient.amount * products[productIngredient.product_id];
      }
    }
    return ingredientsRequiredAmount;
  }
  
  private mapOrderItemsToProducts(orderItems: Partial<OrderItem>[]): Record<string, number> {
    const products = {};
    orderItems.forEach(item => {
      products[item.product_id] = item.quantity;
    });
    return products;
  }
  
  private async processIngredients(
    ingredientRequiredAmount: Record<string, number>,
    products: Record<string, number>
  ): Promise<{ updateRedisData: RedisData[], errors: string[] }> {
    
    const updateRedisData: RedisData[] = [];
    const errors = [];

    for (const ingredientId in ingredientRequiredAmount) {
      const redisKey = `${ingredientId}`;
      const redisValue = await this.redisService.getValue(redisKey);
      const { stock, availableStock , emailSent } = JSON.parse(redisValue);
      if (availableStock < ingredientRequiredAmount[ingredientId]) {
        errors.push(`Insufficient stock for ingredient ${ingredientId} you need ${ingredientRequiredAmount[ingredientId]} but available stock is ${availableStock}.`);
      }else{
        const newAvailableStock = availableStock - ingredientRequiredAmount[ingredientId];
        updateRedisData.push({
          redisKey,
          redisValue: JSON.stringify({ stock, availableStock: newAvailableStock, emailSent }),
          expiry: undefined,
          isNonExpiring: true,
          cutAmount: ingredientRequiredAmount[ingredientId],
        });
      }
    }
  
    return { updateRedisData, errors };
  }
  
  private async updateRedisData(updateRedisData: RedisData[]) {
    this.logger.log(`updating redis data ...`);
    for (const redisData of updateRedisData) {
      await this.redisService.setValue(redisData.redisKey, redisData.redisValue, redisData.expiry, redisData.isNonExpiring);
    }
  }
  
}
interface RedisData {
  redisKey: string;
  redisValue: string;
  expiry: number | undefined;
  isNonExpiring: boolean;
  cutAmount: number;
}