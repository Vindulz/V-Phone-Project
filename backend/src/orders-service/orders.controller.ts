import { Controller, Post, Get, Delete, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add product to cart (or increase quantity if already in cart)' })
  add(@Body() dto: CreateOrderDto) {
    return this.ordersService.addToCart(dto);
  }

  @Get('cart')
  @ApiOperation({ summary: 'Get cart items for a user' })
  getCart(@Query('userId') userId: number) {
    return this.ordersService.getCart(Number(userId));
  }

  @Patch('cart/:id/quantity')
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ) {
    return this.ordersService.updateQuantity(id, Number(quantity));
  }

  @Delete('cart/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.removeFromCart(id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout — converts cart into a placed order' })
  checkout(@Query('userId', ParseIntPipe) userId: number) {
    return this.ordersService.checkout(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get past placed orders for a user' })
  getHistory(@Query('userId') userId: number) {
    return this.ordersService.getOrderHistory(Number(userId));
  }
}