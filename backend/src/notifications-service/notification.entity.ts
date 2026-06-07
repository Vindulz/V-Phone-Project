import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  export type NotificationType = 'checkout' | 'low_stock';
  export type NotificationRole = 'user' | 'admin';
  
  @Entity('notifications')
  export class Notification {
    @PrimaryGeneratedColumn()
    id: number;
  
    
    @Column({ type: 'int', nullable: true })
    userId: number | null;
  
    @Column({ type: 'varchar', length: 10 })
    role: NotificationRole; // 'user' | 'admin'
  
    @Column({ type: 'varchar', length: 20 })
    type: NotificationType; // 'checkout' | 'low_stock'
  
    @Column('text')
    message: string;
  
    @Column({ default: false })
    isRead: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  }