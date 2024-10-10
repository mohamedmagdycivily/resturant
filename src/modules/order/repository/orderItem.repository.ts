import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entity/orderItem.entity';
import { OrderItemInterface } from '../interface/orderItem.interface';

@Injectable()
export class OrderItemRepository implements OrderItemInterface {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderRepo: Repository<OrderItem>
  ) {}

  async findById(id: string): Promise<OrderItem | null> {
    return await this.orderRepo.findOne({where: {id: Number(id)}});
  }

  async findAll(): Promise<OrderItem[]> {
    return this.orderRepo.find();
  }

  async create(orders: Partial<OrderItem>[]): Promise<any>{
    const newOrders = this.orderRepo.create(orders);
    return this.orderRepo.save(orders);
  }
}
