import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductIngredient } from './entity/productIngredient.entity';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { ProductInterfaceToken } from './interface/product.interface';
import { ProductControllerV1 } from './product.controller';
import { RedisModule } from 'src/redis/redis.module';
import { ProductIngredientInterfaceToken } from './interface/productIngredient.interface';
import { ProductIngredientRepository } from './repository/productIngredient.repository';
@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([Product, ProductIngredient])],
  controllers: [ProductControllerV1],
  providers: [
    ProductService,
    {
      provide: ProductInterfaceToken,
      useClass: ProductRepository,
    },
    {
      provide: ProductIngredientInterfaceToken,
      useClass: ProductIngredientRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
