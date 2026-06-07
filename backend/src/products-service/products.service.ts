import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, ILike, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Order } from '../orders-service/order.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order)   private readonly orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productsRepository.create(dto);
    const saved = await this.productsRepository.save(product);
    return { message: 'Product created', productId: saved.id };
  }

  async getBestSellers(limit = 5): Promise<Product[]> {
  // total quantity sold per product, highest first
  const rows = await this.orderRepo
    .createQueryBuilder('o')
    .select('o.productId', 'productId')
    .addSelect('SUM(o.quantity)', 'totalSold')
    .where('o.productId IS NOT NULL')
    .groupBy('o.productId')
    .orderBy('totalSold', 'DESC')
    .limit(limit)
    .getRawMany();

  const ids = rows.map(r => Number(r.productId)).filter(Boolean);
  if (ids.length === 0) return [];

  const products = await this.productRepo.findBy({ id: In(ids) });

  
  const rank = new Map(ids.map((id, i) => [id, i]));
  return products.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
}

  async findAll(search?: string, maxPrice?: number) {
    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }
    if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }

    return this.productsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async delete(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productsRepository.delete(id);
    return { message: 'Product deleted' };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const saved = await this.productsRepository.save(product);
    return { message: 'Product updated successfully', product: saved };
  }

  async decrementStock(productId: number, quantity: number) {
    const product = await this.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock for "${product.name}". Available: ${product.stock}`,
      );
    }

    product.stock -= quantity;
    await this.productsRepository.save(product);
    return product;
  }
}