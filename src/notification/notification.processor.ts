// order.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationManager } from './notificationManager';

@Processor('notification-queue')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);
    constructor(
        @Inject(NotificationManager) private readonly notificationManager: NotificationManager,
    ) {}
    @Process()
    async handleNotificationJob(job: Job) {
        this.logger.log(`Processing jobID ${job.data.jobID} Action ${job.data.action}`);
        const {to, subject, message, type} = job.data;
        await this.notificationManager.sendNotification(to, subject, message, type);
        this.logger.log(`Job done jobID ${job.data.jobID} Action ${job.data.action}`);
    }
}
