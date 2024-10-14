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
    return this.productIngredientRepo
    .createQueryBuilder('productIngredient')
    .leftJoinAndSelect('productIngredient.ingredient', 'ingredient')
    .where('productIngredient.product_id IN (:...productIds)', { productIds })
    .select(['productIngredient.id', 'productIngredient.ingredient_id', 'productIngredient.product_id', 'productIngredient.amount', 'ingredient.name'])
    .getMany();
  }
}
