import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entity/Ingredient.entity';
import { IngredientService } from './ingredient.service';
import { IngredientRepository } from './repository/ingredient.repository';
import { IngredientInterfaceToken } from './interface/ingredient.interface';
import { IngredientControllerV1 } from './ingredient.controller';
import { RedisModule } from 'src/redis/redis.module';
import { IngredientProcessor } from './ingredient.processor';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientControllerV1],
  providers: [
    IngredientService,
    IngredientProcessor,
    {
      provide: IngredientInterfaceToken,
      useClass: IngredientRepository,
    },
  ],
  exports: [IngredientService],
})
export class IngredientModule {}
