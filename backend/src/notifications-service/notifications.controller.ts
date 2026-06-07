import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth-service/jwt-auth.guard';
import { RolesGuard } from '../auth-service/roles.guard';
import { Roles } from '../auth-service/roles.decorator';
import { CurrentUser } from '../auth-service/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── User endpoints ───────────────────────────────────────────────────────

  /** GET /notifications/user/me — ambil notifikasi milik sendiri dari token */
  @Get('user/me')
  getUserNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  /** PATCH /notifications/user/me/read-all */
  @Patch('user/me/read-all')
  markAllUserRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllUserNotificationsAsRead(user.id);
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  /** GET /notifications/admin — hanya role admin */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAdminNotifications() {
    return this.notificationsService.getAdminNotifications();
  }

  /** PATCH /notifications/admin/read-all — hanya role admin */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('admin/read-all')
  markAllAdminRead() {
    return this.notificationsService.markAllAdminNotificationsAsRead();
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  /** PATCH /notifications/:id/read — hanya bisa mark notif milik sendiri */
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const notification = await this.notificationsService.findOne(id);

    // Admin boleh mark notif admin, user hanya boleh mark notif miliknya
    const isAdmin = user.role === 'admin';
    const isOwner = notification.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Kamu tidak bisa mengubah notifikasi milik orang lain');
    }

    return this.notificationsService.markAsRead(id);
  }
}