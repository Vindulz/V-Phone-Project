import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationRole, NotificationType } from './notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { MarkReadResponseDto } from './dto/mark-read-response.dto';

export const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async createUserNotification(
    userId: number,
    type: NotificationType,
    message: string,
  ): Promise<NotificationResponseDto> {
    const notification = this.notificationsRepository.create({
      userId,
      role: 'user',
      type,
      message,
    });
    return this.notificationsRepository.save(notification);
  }

  async createAdminNotification(
    type: NotificationType,
    message: string,
  ): Promise<NotificationResponseDto> {
    // userId is null — visible to all admins
    const notification = this.notificationsRepository.create({
      userId: null,
      role: 'admin',
      type,
      message,
    });
    return this.notificationsRepository.save(notification);
  }

  // ─── Read ────────────────────────────────────────────────────────────────

  async getUserNotifications(userId: number): Promise<NotificationResponseDto[]> {
    return this.notificationsRepository.find({
      where: { userId, role: 'user' },
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminNotifications(): Promise<NotificationResponseDto[]> {
    return this.notificationsRepository.find({
      where: { role: 'admin' },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Mark read ────────────────────────────────────────────────────────────

  async markAsRead(id: number): Promise<MarkReadResponseDto> {
    await this.notificationsRepository.update(id, { isRead: true });
    return { message: 'Notification marked as read' };
  }

  async markAllUserNotificationsAsRead(
    userId: number,
  ): Promise<MarkReadResponseDto> {
    await this.notificationsRepository.update(
      { userId, role: 'user', isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async markAllAdminNotificationsAsRead(): Promise<MarkReadResponseDto> {
    await this.notificationsRepository.update(
      { role: 'admin', isRead: false },
      { isRead: true },
    );
    return { message: 'All admin notifications marked as read' };
  }
}