import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfigAsync } from '../config/config.provider';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Ensures ConfigModule is available
      useFactory: async (configService: ConfigService) => await typeOrmConfigAsync(configService),
      inject: [ConfigService],
    }),  // Registers the TypeORM with your Postgres settings
  ],
})
export class DatabaseModule implements OnModuleInit {
  onModuleInit() {
    console.log('Database connection established successfully!');
  }
}
