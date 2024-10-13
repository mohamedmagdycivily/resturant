export interface NotificationService {
    sendNotification(to: string, subject: string, message: string): Promise<void>;
  }
  