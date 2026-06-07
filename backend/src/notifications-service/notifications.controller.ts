import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── User endpoints ───────────────────────────────────────────────────────

  /** GET /notifications/user/:userId */
  @Get('user/:userId')
  getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  /** PATCH /notifications/user/:userId/read-all */
  @Patch('user/:userId/read-all')
  markAllUserRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllUserNotificationsAsRead(userId);
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  /** GET /notifications/admin */
  @Get('admin')
  getAdminNotifications() {
    return this.notificationsService.getAdminNotifications();
  }

  /** PATCH /notifications/admin/read-all */
  @Patch('admin/read-all')
  markAllAdminRead() {
    return this.notificationsService.markAllAdminNotificationsAsRead();
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  /** PATCH /notifications/:id/read */
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }
}