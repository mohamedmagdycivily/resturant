import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { IngredientInterface } from '../interface/ingredient.interface';
import { Ingredient } from '../entity/Ingredient.entity';
import { ObjectId } from 'mongodb';

export class IngredientRepository implements IngredientInterface {
  constructor(
    @InjectRepository(Ingredient)
    private readonly orderRepo: MongoRepository<Ingredient>
  ) {}
  findById(id: string): Promise<Ingredient | null> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<Ingredient[]> {
    throw new Error('Method not implemented.');
  }
  create(order: Partial<Ingredient>): Promise<Ingredient> {
    throw new Error('Method not implemented.');
  }
  aggregate(pipeline: any[]): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}
