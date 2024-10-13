// order.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OrderService } from './order.service';

@Processor('my-queue')
export class OrderProcessor {
    private readonly logger = new Logger(OrderProcessor.name);
    constructor(
        @Inject(OrderService) private readonly orderService: OrderService,
    ) {}
    @Process()
    async handleOrderJob(job: Job) {
        this.logger.log(`Processing jobID ${job.data.jobID} Action ${job.data.action}`);
        await this.orderService.handleCreateOrderJob(job.data);
        this.logger.log(`Job done jobID ${job.data.jobID} Action ${job.data.action}`);
    }
}
