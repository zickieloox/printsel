import { RoleType } from '@/constants';
import { PermissionEntity } from '@/modules/permission/permission.entity';
import { IsAlpha } from 'class-validator';
import { Status } from 'shared';
export class CreateRoleDto {
  @IsAlpha()
  readonly name: RoleType;

  readonly description?: string;

  readonly permissions?: PermissionEntity[];

  readonly status?: Status;
}
