import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entity/orderItem.entity';
import { OrderItemInterface } from '../interface/orderItem.interface';

@Injectable()
export class OrderItemRepository implements OrderItemInterface {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>
  ) {}

  async findById(id: string): Promise<OrderItem | null> {
    return await this.orderItemRepo.findOne({where: {id: Number(id)}});
  }

  async findAll(): Promise<OrderItem[]> {
    return this.orderItemRepo.find();
  }

  async create(orderItemsData: Partial<OrderItem>[], manager: EntityManager): Promise<OrderItem[]> {
    const orderItems = orderItemsData.map(item => manager.create(OrderItem, item));
    return await manager.save(orderItems);
  }
}
