import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('my-queue') private readonly myQueue: Queue,
    @InjectQueue('notification-queue' ) private readonly notificationQueue: Queue
  ) {}

  async addJob(data: any) {
    await this.myQueue.add(data, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,              // Number of retry attempts
      backoff: {                 // Retry strategy
          type: 'fixed',
          delay: 5000,           // 5 seconds delay between retries
      },
    });
    console.log('Job added to the my-queue');
  }

  async addNotificationJob(data: any) {
    await this.notificationQueue.add(data, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,              // Number of retry attempts
      backoff: {                 // Retry strategy
          type: 'fixed',
          delay: 5000,           // 5 seconds delay between retries
      },
    });
    console.log('Job added to the notificationQueue');
  }
}
