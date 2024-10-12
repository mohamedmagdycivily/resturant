import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { ProductIngredientInterface } from '../interface/productIngredient.interface';
import { ProductIngredient } from '../entity/productIngredient.entity';

export class ProductIngredientRepository implements ProductIngredientInterface {
  constructor(
    @InjectRepository(ProductIngredient)
    private readonly productIngredientRepo: Repository<ProductIngredient>
  ) {}
  findAll(productIds: string[]): Promise<ProductIngredient[]> {
    return this.productIngredientRepo.find({
      where: { product_id: In(productIds) },
      select: ['id','ingredient_id', 'product_id', 'amount'],
    })
  }
}
