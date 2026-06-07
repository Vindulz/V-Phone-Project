import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
 
export class UpdateProductDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() category?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) stock?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spec1?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spec2?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spec3?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() spec4?: string;
}