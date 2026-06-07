import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Use this guard on any route that requires a logged-in user:
// @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}