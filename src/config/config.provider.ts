import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

export const typeOrmConfigAsync = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      port: parseInt(configService.get<string>('DB_PORT'), 10),
      database: configService.get<string>('DB_DATABASE'),
      synchronize: false,
      logging: true,
      autoLoadEntities: true,
      entities: [path.resolve(__dirname, '..', '/modules/**/entity/*.entity{.ts,.js}')],
      migrations: [path.resolve(__dirname, '..', 'migrations', '*{.ts,.js}')],
    };
  };
  

export const redisConfig = async(configService: ConfigService): Promise<RedisModuleOptions> => {
    return {
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
    };
  };
