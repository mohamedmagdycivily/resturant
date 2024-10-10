import { Ingredient } from '../entity/Ingredient.entity';

export const IngredientInterfaceToken = Symbol('OrderInterface');

export interface IngredientInterface {
  findById(id: string): Promise<Ingredient | null>;
  findAll(): Promise<Ingredient[]>;
  create(order: Partial<Ingredient>): Promise<Ingredient>;
  aggregate(pipeline: any[]): Promise<any[]>;
}
