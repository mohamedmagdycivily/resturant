// order.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { IngredientService } from './ingredient.service';

@Processor('my-queue')
export class IngredientProcessor {
    private readonly logger = new Logger(IngredientProcessor.name);
    constructor(
        @Inject(IngredientService) private readonly ingredientService: IngredientService,
    ) {}
    @Process()
    async handleOrderJob(job: Job) {
        this.logger.log(`Processing jobID ${job.data.jobID} Action ${job.data.action}`);
        await this.ingredientService.update(job.data);
        this.logger.log(`Job done jobID ${job.data.jobID} Action ${job.data.action}`);
    }
}
