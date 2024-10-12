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

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @Inject(OrderInterfaceToken) private readonly orderRepo: OrderInterface,
    @Inject(OrderItemInterfaceToken) private readonly orderItemRepo: OrderItemInterface,
    @Inject(ProductService) private readonly productService: ProductService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  async create(orderItems: Partial<OrderItem>[]) {
    const products = this.mapOrderItemsToProducts(orderItems);
    const productIngredients = await this.productService.findAll(Object.keys(products));
    
    const redisKeys = this.generateRedisKeys(productIngredients);
    const acquiredLocks = await this.redisService.acquireLocks(redisKeys);
  
    try {
      const { updateRedisData, errors } = await this.processIngredients(productIngredients, products);
      
      if (errors.length > 0) {
        this.logger.log(`create order errors: ${errors}`);
        throw new BadRequestException(errors.join("\n"));
      }
      
      await this.updateRedisData(updateRedisData);
      const order = await this.orderRepo.create();
      await this.orderItemRepo.create(
        orderItems.map(orderItem => ({
          ...orderItem,
          order_id: order.id,
        }))
      );
      
      this.logger.log(`publish message to update psql ...`);
      this.logger.log(`sending mail as the amount is cut by 50% ...`);
      //TODO: update values in psql
      // TODO: send mail
    } finally {
      await this.redisService.releaseLocks(acquiredLocks);
    }
  }
  
  private mapOrderItemsToProducts(orderItems: Partial<OrderItem>[]): Record<string, number> {
    const products = {};
    orderItems.forEach(item => {
      products[item.product_id] = item.quantity;
    });
    return products;
  }
  
  private generateRedisKeys(productIngredients: ProductIngredient[]): string[] {
    return productIngredients.map(item => `${item.product_id}:${item.ingredient_id}`);
  }
  
  private async processIngredients(
    productIngredients: ProductIngredient[], 
    products: Record<string, number>
  ): Promise<{ updateRedisData: RedisData[], errors: string[] }> {
    
    const updateRedisData: RedisData[] = [];
    const errors = [];
  
    for (const productIngredient of productIngredients) {
      const redisKey = `${productIngredient.product_id}:${productIngredient.ingredient_id}`;
      const redisValue = await this.redisService.getValue(redisKey);
      const { stock, availableStock , emailSent } = JSON.parse(redisValue);
      const orderedProductIngredientAmount = products[productIngredient.product_id] * productIngredient.amount;
      // TODO: check for 50% cut and add new property to have the email messages to be sent directly to the job queue
      if (availableStock < orderedProductIngredientAmount) {
        errors.push(`Insufficient stock for product ${productIngredient.product_id}, ingredient ${productIngredient.ingredient_id} you need ${orderedProductIngredientAmount} but available stock is ${availableStock}.`);
      } else {
        const newAvailableStock = availableStock - orderedProductIngredientAmount;
        updateRedisData.push({
          redisKey,
          redisValue: JSON.stringify({ availableStock: newAvailableStock, emailSent }),
          expiry: undefined,
          isNonExpiring: true,
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
}