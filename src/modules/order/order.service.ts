import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  OrderInterface,
  OrderInterfaceToken,
} from './interface/order.interface';
import { Order } from './entity/order.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { OrderItemInterface, OrderItemInterfaceToken } from './interface/orderItem.interface';
import { OrderItem } from './entity/orderItem.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(OrderInterfaceToken) private readonly orderRepo: OrderInterface,
    @Inject(OrderItemInterfaceToken) private readonly orderItemRepo: OrderItemInterface,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findById(id: string): Promise<Order | null> {
    return this.orderRepo.findById(id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async create(orderItems: Partial<OrderItem>[]):  Promise<Partial<OrderItem>[]> {
    const order = await this.orderRepo.create();
    return this.orderItemRepo.create(orderItems.map(item => ({ ...item, order_id: order.id })));
  }

}
