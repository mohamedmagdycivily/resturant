import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductIngredient } from './entity/productIngredient.entity';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { ProductInterfaceToken } from './interface/product.interface';
import { ProductController } from './product.controller';
import { RedisModule } from 'src/redis/redis.module';
@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([Product, ProductIngredient])],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: ProductInterfaceToken,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
