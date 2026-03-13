import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

import { FirebaseAdminService } from './firebase-admin.service'

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      throw new UnauthorizedException('Empty bearer token')
    }

    try {
      const decoded = await this.firebaseAdminService.verifyIdToken(token)
      request.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      }

      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token')
    }
  }
}
