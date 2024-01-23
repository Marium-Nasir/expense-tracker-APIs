/* eslint-disable prettier/prettier */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { HandleJwt } from './helpingfunctions/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly handleJwt: HandleJwt) {
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.handleJwt.verifyToken(token);
      request['user'] = payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err; // Rethrow the UnauthorizedException
      }

      // Handle other errors (if any)
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
