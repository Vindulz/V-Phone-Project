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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth-service/roles.guard';
import { Roles } from '../auth-service/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const multerOptions = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Only JPG, PNG, and WEBP images are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a new product with image (admin only)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  create(@Body() dto: CreateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.productsService.create({ ...dto, imageUrl });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product with optional new image (admin only)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.productsService.update(id, { ...dto, ...(imageUrl ? { imageUrl } : {}) });
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best selling products' })
  getBestSellers() {
    return this.productsService.getBestSellers(5);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with optional search and price filter)' })
  @ApiQuery({ name: 'search', required: false, example: 'gaming' })
  @ApiQuery({ name: 'maxPrice', required: false, example: 10000000 })
  findAll(
    @Query('search') search?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productsService.findAll(search, maxPrice ? Number(maxPrice) : undefined);
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