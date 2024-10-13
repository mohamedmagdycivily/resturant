import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.interface';
import { EmailNotificationService } from './emailNotificationService';

@Injectable()
export class NotificationManager {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async sendNotification(to: string, subject: string, message: string, type: 'email' | 'sms') {
    if (type === 'email') {
      await this.emailNotificationService.sendNotification(to, subject, message);
    } else if (type === 'sms') {
      // Send SMS notification
    } else {
      throw new Error('Unsupported notification type');
    }
  }
}
