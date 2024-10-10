import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ProductInterface,
  ProductInterfaceToken,
} from './interface/product.interface';
import { Product } from './entity/product.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class ProductService {
  constructor(
    @Inject(ProductInterfaceToken) private readonly productRepo: ProductInterface,
    @InjectRedis() private readonly redis: Redis,
  ) {}

}
