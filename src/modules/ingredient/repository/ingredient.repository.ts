import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IngredientInterface } from '../interface/ingredient.interface';
import { Ingredient } from '../entity/Ingredient.entity';

export class IngredientRepository implements IngredientInterface {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>
  ) {}
  findById(id: string): Promise<Ingredient | null> {
    throw new Error('Method not implemented.');
  }
  findAll(ids: string[]): Promise<Ingredient[]> {
    return this.ingredientRepo.find({where: { id: In(ids) }});
  }
  create(order: Partial<Ingredient>): Promise<Ingredient> {
    throw new Error('Method not implemented.');
  }
  update({ where, data }: { where: any; data: any; }): Promise<any> {
    console.log('🌟🌟🌟{ where, data }  =  ', { where, data });
    return this.ingredientRepo
      .createQueryBuilder()
      .update('ingredient')
      .set({
        available_stock: () => `"available_stock" - ${data.cutAmount}`,  // Raw SQL operation
      })
      .where('id = :id', { id: where.id })
      .execute();
    // return this.ingredientRepo.update(where, data);
  }
}
