import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, password: hashedPassword });
    const saved = await this.usersRepository.save(user);
    return { message: 'Registration successful', userId: saved.id };
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async updateProfile(userId: number, dto: UpdateUserDto, currentPassword?: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // If changing password, verify current password first
    if (dto.password) {
      if (!currentPassword) {
        throw new UnauthorizedException('Current password is required to set a new password');
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      user.password = await bcrypt.hash(dto.password, 10);
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email is already in use');
      user.email = dto.email;
    }

    if (dto.username) user.username = dto.username;

    const saved = await this.usersRepository.save(user);
    return {
      message: 'Profile updated successfully',
      username: saved.username,
      email: saved.email,
    };
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.delete(id);
    return { message: `User "${user.username}" deleted successfully` };
  }
}