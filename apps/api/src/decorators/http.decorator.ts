import { applyDecorators, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard, PublicRoute } from 'core';
import type { RoleType } from 'shared';

import { PermissionsGuard, RolesGuard } from '@/guards';
import { AuthUserInterceptor } from '@/interceptors';

export function Auth(roles: RoleType[] = [], options?: Partial<{ public: boolean }>): MethodDecorator {
  const isPublicRoute = options?.public;

  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard({ public: isPublicRoute }), RolesGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    PublicRoute(isPublicRoute),
  );
}

export function Perm(permission: string): MethodDecorator {
  return applyDecorators(SetMetadata('permission', permission), UseGuards(AuthGuard(), PermissionsGuard));
}
