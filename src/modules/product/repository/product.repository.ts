import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ProductInterface } from '../interface/product.interface';
import { Product } from '../entity/product.entity';
import { ObjectId } from 'mongodb';

export class ProductRepository implements ProductInterface {
  constructor(
    @InjectRepository(Product)
    private readonly orderRepo: MongoRepository<Product>
  ) {}
  findById(id: string): Promise<Product | null> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<Product[]> {
    throw new Error('Method not implemented.');
  }
  create(order: Partial<Product>): Promise<Product> {
    throw new Error('Method not implemented.');
  }
  aggregate(pipeline: any[]): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

}
