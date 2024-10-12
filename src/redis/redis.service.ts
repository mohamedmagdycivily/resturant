import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly LOCK_EXPIRY_TIME: number;
  private readonly MAX_RETRIES: number;
  private readonly RETRY_DELAY: number;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {
    this.LOCK_EXPIRY_TIME = this.configService.get<number>('REDIS_LOCK_EXPIRY_TIME', 100);
    this.MAX_RETRIES = this.configService.get<number>('REDIS_MAX_RETRIES', 5);
    this.RETRY_DELAY = this.configService.get<number>('REDIS_RETRY_DELAY', 1000);
  }

  async acquireLocks(keys: string[]): Promise<string[]> {
    const acquiredLocks: string[] = [];
    
    try {
      for (const key of keys) {
        const lockKey = this.getLockKey(key);
        const lockAcquired = await this.acquireLock(lockKey);
        if (!lockAcquired) {
          throw new Error(`Failed to acquire lock for key: ${key}`);
        }
        acquiredLocks.push(lockKey);
      }
      this.logger.log(`locks Acquired for keys: ${keys.join(', ')}`);
      return acquiredLocks;
    } catch (error) {
      this.logger.error(`Error acquiring locks: ${error.message}`);
      await this.releaseLocks(acquiredLocks);
      throw error;
    }
  }

  async acquireLock(key: string): Promise<boolean> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.redis.set(key, 'locked', 'EX', this.LOCK_EXPIRY_TIME, 'NX');
        if (result === 'OK') {
          return true;
        }
      } catch (error) {
        this.logger.warn(`Error attempting to acquire lock: ${error.message}`);
      }
      await this.delay(this.RETRY_DELAY);
    }
    return false;
  }

  async releaseLocks(keys: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.del(key);
    }
    try {
      await pipeline.exec();
      this.logger.log(`locks Released for keys: ${keys.join(', ')}`);
    } catch (error) {
      this.logger.error(`Error releasing locks: ${error.message}`);
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Error getting value for key ${key}: ${error.message}`);
      return null;
    }
  }

  async setValue(key: string, value: string, expiry?: number, isNonExpiring?: boolean): Promise<boolean> {
    try {
        // If isNonExpiring is true, do not set an expiration
        const result = isNonExpiring 
            ? await this.redis.set(key, value) // No expiry argument
            : await this.redis.set(key, value, 'EX', expiry || this.LOCK_EXPIRY_TIME); // Use expiry

        return result === 'OK';
    } catch (error) {
        this.logger.error(`Error setting value for key ${key}: ${error.message}`);
        return false;
    }
}


  private getLockKey(key: string): string {
    return `lock:${key}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}