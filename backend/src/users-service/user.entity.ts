import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type UserRole = 'user' | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  gender: string;

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole; // 'user' or 'admin'

  @CreateDateColumn()
  createdAt: Date;
}