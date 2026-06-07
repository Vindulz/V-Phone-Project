import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth-service/roles.guard';
import { Roles } from '../auth-service/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users - admin only' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { dto: UpdateUserDto; currentPassword?: string },
  ) {
    return this.usersService.updateProfile(id, body.dto, body.currentPassword);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}