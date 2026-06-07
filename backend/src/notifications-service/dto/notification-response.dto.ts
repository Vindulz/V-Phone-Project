import { NotificationRole, NotificationType } from '../notification.entity';

export class NotificationResponseDto {
  id: number;
  userId: number | null;
  role: NotificationRole;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}