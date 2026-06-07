import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products-service/products.module';
import { NotificationsModule } from '../notifications-service/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ProductsModule,
    NotificationsModule, 
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}