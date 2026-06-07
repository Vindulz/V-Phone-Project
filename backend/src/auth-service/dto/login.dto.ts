import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  password: string;
}