import { IsAlpha } from 'class-validator';
import { EnumFieldOptional, StringField, StringFieldOptional } from 'core';
import { PermissionAction, Status } from 'shared';
export class CreatePermissionDto {
  @StringField()
  @IsAlpha()
  readonly name: string;

  @StringFieldOptional()
  readonly description?: string;

  @EnumFieldOptional(() => PermissionAction, {
    default: PermissionAction.VIEW,
  })
  readonly action?: string;

  @EnumFieldOptional(() => Status, {
    default: Status.Active,
  })
  readonly status?: string;
}
