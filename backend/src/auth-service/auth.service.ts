import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users-service/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    // role is now included in the token payload
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role, // ← added
    };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // ← returned so frontend can store it
    };
  }
}