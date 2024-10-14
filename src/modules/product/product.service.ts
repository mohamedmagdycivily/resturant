import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ProductInterface,
  ProductInterfaceToken,
} from './interface/product.interface';
import { Product } from './entity/product.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ProductIngredient } from './entity/productIngredient.entity';
import { ProductIngredientInterface, ProductIngredientInterfaceToken } from './interface/productIngredient.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(ProductInterfaceToken) private readonly productRepo: ProductInterface,
    @Inject(ProductIngredientInterfaceToken) private readonly productIngredientRepo: ProductIngredientInterface,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAllProductIngredients(ids: string[]): Promise<ProductIngredient[]> {
    return this.productIngredientRepo.findAll(ids);
  }
}
