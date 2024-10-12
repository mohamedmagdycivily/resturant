import { Ingredient } from '../entity/Ingredient.entity';

export const IngredientInterfaceToken = Symbol('IngredientInterface');

export interface IngredientInterface {
  findById(id: string): Promise<Ingredient | null>;
  findAll(ids: string[]): Promise<Ingredient[]>;
  create(ingredient: Partial<Ingredient>): Promise<Ingredient>;
  update({where, data}: {where: any, data: any}): Promise<any>
}
