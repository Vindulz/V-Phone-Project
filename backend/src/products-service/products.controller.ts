import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { RolesGuard } from '../auth-service/roles.guard';
import { Roles } from '../auth-service/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new product (admin only)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a product image (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'public', 'assets'),
        filename: (req, file, cb) => {
          // e.g. product-1717123456789.png
          const uniqueName = `product-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new BadRequestException('Only image files are allowed (jpg, png, webp)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      message: 'Image uploaded successfully',
      imageUrl: `assets/${file.filename}`, // relative path for frontend
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with optional search and price filter)' })
  @ApiQuery({ name: 'search', required: false, example: 'gaming' })
  @ApiQuery({ name: 'maxPrice', required: false, example: 10000000 })
  findAll(
    @Query('search') search?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productsService.findAll(
      search,
      maxPrice ? Number(maxPrice) : undefined,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}