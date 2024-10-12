import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('my-queue') private readonly queue: Queue
  ) {}

  async addJob(data: any) {
    await this.queue.add(data);
    console.log('Job added to the queue');
  }
}
