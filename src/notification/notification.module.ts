import { Module } from '@nestjs/common';
import { NotificationManager } from './notificationManager';
import { EmailNotificationService } from './emailNotificationService';
import { ConfigModule } from '@nestjs/config';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [ConfigModule],
  providers: [
    NotificationManager,
    EmailNotificationService,
    NotificationProcessor,
  ],
  exports: [NotificationManager],
})
export class NotificationModule {}
