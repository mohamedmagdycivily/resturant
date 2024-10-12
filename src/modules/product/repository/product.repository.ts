import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInterface } from '../interface/product.interface';
import { Product } from '../entity/product.entity';

export class ProductRepository implements ProductInterface {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
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
}
