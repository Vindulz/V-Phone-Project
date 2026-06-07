import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    username: string;
    role: string;
  }) {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role, // ← now passed through to req.user
    };
  }
}