import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { Order } from '../orders-service/order.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], 
})
export class ProductsModule {}