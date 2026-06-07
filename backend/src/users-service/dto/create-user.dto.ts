import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsNotEmpty()
  gender: string;
}