import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType, Status } from 'shared';

import { RoleService } from '../modules/role/role.service';
import type { UserDocument } from '../modules/user/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>('permission', context.getHandler());

    const request = context.switchToHttp().getRequest();
    const user = <UserDocument>request.user;

    if (user.otherPermissions?.some((item) => item.name === permission && item.status === Status.Active)) {
      return true;
    }

    if (user.role?.name === RoleType.SuperAdmin) {
      return true;
    }

    const role = await this.roleService.findOneById(user.role!._id);

    if (!role.permissions) {
      return false;
    }

    return role.permissions.some((item) => item.name === permission && item.status === Status.Active);
  }
}
