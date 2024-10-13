import { Module, Global, OnModuleInit } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from '../config/config.provider';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => await redisConfig(configService),
      inject: [ConfigService],
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
