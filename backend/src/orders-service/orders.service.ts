import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products-service/products.service';
import { NotificationsService, LOW_STOCK_THRESHOLD } from '../notifications-service/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
  ) {}

  async addToCart(dto: CreateOrderDto) {
    const product = await this.productsService.findOne(dto.productId);
    const quantity = dto.quantity ?? 1;

    // Check stock before adding to cart
    if (product.stock === 0) {
      throw new BadRequestException(`"${product.name}" is out of stock`);
    }
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      );
    }

    // If already in cart, increase quantity
    const existing = await this.ordersRepository.findOne({
      where: { userId: dto.userId, productId: dto.productId, status: 'cart' },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        throw new BadRequestException(
          `Cannot add ${quantity} more — only ${product.stock - existing.quantity} unit(s) left`,
        );
      }
      existing.quantity = newQty;
      await this.ordersRepository.save(existing);
      return { message: `${product.name} quantity updated`, orderId: existing.id };
    }

    const order = this.ordersRepository.create({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      userId: dto.userId,
      status: 'cart',
    });

    const saved = await this.ordersRepository.save(order);
    return { message: `${product.name} added to cart`, orderId: saved.id };
  }

  async updateQuantity(id: number, quantity: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Item not found in cart');
    if (quantity < 1) throw new BadRequestException('Quantity must be at least 1');

    // Check stock before updating
    const product = await this.productsService.findOne(order.productId);
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      );
    }

    order.quantity = quantity;
    await this.ordersRepository.save(order);
    return { message: 'Quantity updated', quantity: order.quantity };
  }

  async getCart(userId: number) {
    return this.ordersRepository.find({
      where: { userId, status: 'cart' },
      order: { orderedAt: 'DESC' },
    });
  }

  async removeFromCart(id: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Item not found in cart');
    await this.ordersRepository.delete(id);
    return { message: 'Item removed from cart' };
  }

  async checkout(userId: number) {
    const cartItems = await this.ordersRepository.find({
      where: { userId, status: 'cart' },
    });

    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');

    // Step 1 — final stock check for ALL items before doing anything
    for (const item of cartItems) {
      const product = await this.productsService.findOne(item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `"${product.name}" only has ${product.stock} unit(s) left. ` +
          `Please update your cart before checking out.`,
        );
      }
    }

    // Step 2 — decrement stock for each item
    await Promise.all(
      cartItems.map(item =>
        this.productsService.decrementStock(item.productId, item.quantity),
      ),
    );

    // Step 3 — mark all cart items as placed
    await Promise.all(
      cartItems.map(item =>
        this.ordersRepository.update(item.id, { status: 'placed' }),
      ),
    );

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Step 4 — notify the user about their successful checkout
    const itemSummary = cartItems
      .map(i => `${i.productName} x${i.quantity}`)
      .join(', ');

    await this.notificationsService.createUserNotification(
      userId,
      'checkout',
      `Your order was placed successfully! Items: ${itemSummary}. Total: Rp${total.toLocaleString('id-ID')}.`,
    );

    // Step 5 — notify admins for any product that has fallen below the low stock threshold
    await Promise.all(
      cartItems.map(async (item) => {
        const updatedProduct = await this.productsService.findOne(item.productId);
        if (updatedProduct.stock <= LOW_STOCK_THRESHOLD) {
          await this.notificationsService.createAdminNotification(
            'low_stock',
            `Low stock alert: "${updatedProduct.name}" only has ${updatedProduct.stock} unit(s) remaining.`,
          );
        }
      }),
    );

    return {
      message: 'Checkout successful!',
      itemCount: cartItems.length,
      items: cartItems.map(i => ({
        name: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
    };
  }

  async getOrderHistory(userId: number) {
    return this.ordersRepository.find({
      where: { userId, status: 'placed' },
      order: { orderedAt: 'DESC' },
    });
  }
}