import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
}