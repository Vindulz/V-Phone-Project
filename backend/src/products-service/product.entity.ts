import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 15, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  spec1: string;

  @Column({ nullable: true })
  spec2: string;

  @Column({ nullable: true })
  spec3: string;

  @Column({ nullable: true })
  spec4: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}