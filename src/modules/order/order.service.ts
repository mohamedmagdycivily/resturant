import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  OrderInterface,
  OrderInterfaceToken,
} from './interface/order.interface';
import { Order } from './entity/order.entity';
import { CreateOrderDTO, UpdateOrderDTO } from './dto/order.dto';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class OrderService {
  constructor(
    @Inject(OrderInterfaceToken) private readonly orderRepo: OrderInterface,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findById(id: string): Promise<Order | null> {
    return this.orderRepo.findById(id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

}
