import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/orderItem.entity';
import { OrderService } from './order.service';
import { OrderRepository } from './repository/order.repository';
import { OrderInterfaceToken } from './interface/order.interface';
import { OrderControllerV1 } from './order.controller';
import { RedisModule } from 'src/redis/redis.module';
import { OrderItemInterfaceToken } from './interface/orderItem.interface';
import { OrderItemRepository } from './repository/orderItem.repository';
import { ProductModule } from '../product/product.module';
import { MyBullModule } from 'src/bull/bull.module';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderProcessor } from './order.processor';
import { IngredientModule } from '../ingredient/ingredient.module';

@Module({
  imports: [IngredientModule, ProductModule, RedisModule, MyBullModule, NotificationModule, TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrderControllerV1],
  providers: [
    OrderService,
    {
      provide: OrderInterfaceToken,
      useClass: OrderRepository,
    },
    {
      provide: OrderItemInterfaceToken,
      useClass: OrderItemRepository,
    },
    OrderProcessor,
  ],
  exports: [OrderService],
})
export class OrderModule {}
