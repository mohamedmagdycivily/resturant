import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { OrderInterface } from '../interface/order.interface';
import { Order } from '../entity/order.entity';
import { ObjectId } from 'mongodb';

export class OrderRepository implements OrderInterface {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: MongoRepository<Order>
  ) {}

  async findById(id: string): Promise<Order | null> {
    const objectId = new ObjectId(id); 
    return this.orderRepo.findOne({ where: { _id: objectId } });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find();
  }

  async create(order: Partial<Order>): Promise<Order> {
    const newOrder = this.orderRepo.create(order);
    return this.orderRepo.save(newOrder);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.orderRepo.aggregate(pipeline).toArray();
  }
}
