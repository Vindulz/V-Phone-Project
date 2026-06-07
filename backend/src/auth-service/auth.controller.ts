import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Protected route — only works with a valid Bearer token
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user info from token' })
  @ApiResponse({ status: 200, description: 'Returns the logged-in user' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  getMe(@GetUser() user: any) {
    return user;
  }
}