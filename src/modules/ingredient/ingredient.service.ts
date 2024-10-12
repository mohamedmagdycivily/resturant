import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IngredientInterface,
  IngredientInterfaceToken,
} from './interface/ingredient.interface';
import { Ingredient } from './entity/Ingredient.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class IngredientService {
  constructor(
    @Inject(IngredientInterfaceToken) private readonly ingredientRepo: IngredientInterface,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async update({ where, data }: { where: any; data: any; }): Promise<any> {
    return this.ingredientRepo.update({ where, data });
  }
}
