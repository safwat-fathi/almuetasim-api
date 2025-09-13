import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import CONSTANTS from 'src/common/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(CONSTANTS.AUTH_GUARDS.JWT) {}
export class JwtRefreshGuard extends AuthGuard(
  CONSTANTS.AUTH_GUARDS.JWT_REFRESH,
) {}
