import { ProductIngredient } from '../entity/productIngredient.entity';

export const ProductIngredientInterfaceToken = Symbol('ProductIngredient');

export interface ProductIngredientInterface {
  findAll(productIds: string[]): Promise<ProductIngredient[]>;
}
