import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.interface';
const mailjet = require('node-mailjet');
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailNotificationService implements NotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private mailjetClient;

  constructor(
    @Inject() private readonly configService: ConfigService,
  ) {
    this.mailjetClient = new mailjet({
      apiKey: this.configService.get<string>('MAILJET_APIKEY'),
      apiSecret: this.configService.get<string>('MAILJET_SECRETKEY'),
    });
  }

  async sendNotification(to: string, subject: string, message: string): Promise<void> {
    const request = this.mailjetClient.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.configService.get<string>('MAILJET_FROM_EMAIL'),
            Name: 'Mohamed Hanafy',
          },
          To: [
            {
              Email: to,
              Name: 'Recipient Name',
            },
          ],
          Subject: subject,
          TextPart: message,
        },
      ],
    });

    try {
      await request;
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new Error('Email sending failed');
    }
  }
}
