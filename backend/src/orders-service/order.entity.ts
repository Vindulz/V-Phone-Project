import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column('decimal', { precision: 15, scale: 2 })
  price: number; // unit price

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ default: 'cart' })
  status: string;

  @CreateDateColumn()
  orderedAt: Date;
}