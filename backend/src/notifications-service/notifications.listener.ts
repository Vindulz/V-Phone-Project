import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService, LOW_STOCK_THRESHOLD } from './notifications.service';
import { NotificationType } from './notification.entity';

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('checkout.success')
  async handleCheckoutSuccess(payload: { 
    userId: number; 
    items: { name: string; quantity: number }[]; 
    total: number; 
  }) {
    const itemSummary = payload.items
      .map(i => `${i.name} x${i.quantity}`)
      .join(', ');

    const message = `Your order was placed successfully! Items: ${itemSummary}. Total: Rp${payload.total.toLocaleString('id-ID')}.`;

    await this.notificationsService.createUserNotification(
      payload.userId,
      'checkout' as NotificationType,
      message,
    );
  }

  @OnEvent('product.stock_checked')
  async handleProductStockCheck(payload: { productName: string; stock: number }) {
    
    if (payload.stock <= LOW_STOCK_THRESHOLD) {
      const message = `Low stock alert: "${payload.productName}" only has ${payload.stock} unit(s) remaining.`;

      await this.notificationsService.createAdminNotification(
        'low_stock' as NotificationType,
        message,
      );
    }
  }
}