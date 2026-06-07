import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'john_doe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'john@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'NewPassword123', required: false })
  @IsOptional()
  @MinLength(8)
  password?: string;
}