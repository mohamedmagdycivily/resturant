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
    await this.myQueue.add(data);
    console.log('Job added to the my-queue');
  }

  async addNotificationJob(data: any) {
    await this.notificationQueue.add(data);
    console.log('Job added to the notificationQueue');
  }
}
