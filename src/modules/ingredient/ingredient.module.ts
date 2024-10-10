import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entity/Ingredient.entity';
import { IngredientService } from './ingredient.service';
import { IngredientRepository } from './repository/ingredient.repository';
import { IngredientInterfaceToken } from './interface/ingredient.interface';
import { IngredientController } from './ingredient.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientController],
  providers: [
    IngredientService,
    {
      provide: IngredientInterfaceToken,
      useClass: IngredientRepository,
    },
  ],
  exports: [IngredientService],
})
export class IngredientModule {}
