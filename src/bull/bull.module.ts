import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from 'src/config/config.provider';
import { Product } from 'src/modules/product/entity/product.entity';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule, Product],
      useFactory: async (configService: ConfigService) => await redisConfig(configService) as Promise<BullRootModuleOptions> | BullRootModuleOptions,
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'my-queue' }),
  ],
  providers: [
    QueueService,
  ],
  exports: [QueueService],
})
export class MyBullModule implements OnModuleInit {
    onModuleInit() {
      console.log('Bull established successfully');
    }
  }
