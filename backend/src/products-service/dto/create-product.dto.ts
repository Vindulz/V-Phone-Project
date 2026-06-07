import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'V-Phone XG Pro' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 23459999 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'gaming', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'Snapdragon 8 Gen 2', required: false })
  @IsOptional()
  @IsString()
  spec1?: string;

  @ApiProperty({ example: '120Hz AMOLED Display', required: false })
  @IsOptional()
  @IsString()
  spec2?: string;

  @ApiProperty({ example: '6000mAh Battery', required: false })
  @IsOptional()
  @IsString()
  spec3?: string;

  @ApiProperty({ example: '256GB Storage', required: false })
  @IsOptional()
  @IsString()
  spec4?: string;

  @ApiProperty({ example: 'Flagship phone with 200MP camera', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}