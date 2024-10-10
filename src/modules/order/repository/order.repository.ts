import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInterface } from '../interface/order.interface';
import { Order } from '../entity/order.entity';

@Injectable()
export class OrderRepository implements OrderInterface {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>
  ) {}

  async findById(id: string): Promise<Order | null> {
    return await this.orderRepo.findOne({ where: { id: parseInt(id, 10) } });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find();
  }

  async create(): Promise<Order> {
    const newOrder = this.orderRepo.create();
    return this.orderRepo.save(newOrder);
  }
}
