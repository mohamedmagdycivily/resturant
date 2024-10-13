import { Module } from '@nestjs/common';
import { NotificationManager } from './notificationManager';
import { EmailNotificationService } from './emailNotificationService';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    NotificationManager,
    EmailNotificationService,
  ],
  exports: [NotificationManager],
})
export class NotificationModule {}
