import { Module, Global, OnModuleInit } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from '../config/config.provider';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule], // Ensures ConfigModule is available
      useFactory: async (configService: ConfigService) => await redisConfig(configService),
      inject: [ConfigService], // Injects ConfigService into the factory function
    }),
  ],
  providers: [RedisService],
  exports: [NestRedisModule, RedisService],
})
export class RedisModule implements OnModuleInit {
  onModuleInit() {
    console.log('Redis connection established successfully!');
  }
}
