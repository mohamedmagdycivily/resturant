import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../modules/order/order.module';
import { IngredientModule } from '../modules/ingredient/ingredient.module';
import { ProductModule } from '../modules/product/product.module';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { MyBullModule } from '../bull/bull.module'; 
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`, // Loads the appropriate .env file NOT NECCESSARRY
    }),
    OrderModule,
    IngredientModule,
    ProductModule,
    DatabaseModule,
    RedisModule,
    MyBullModule,
    NotificationModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
  exports:[
    AppService,
  ]
})
export class AppModule {}