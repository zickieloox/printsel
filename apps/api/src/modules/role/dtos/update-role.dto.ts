import { EnumFieldOptional, StringFieldOptional } from 'core';
import { Status } from 'shared';
export class UpdateRoleDto {
  @StringFieldOptional()
  description?: string;

  @EnumFieldOptional(() => Status, {
    default: Status.Active,
  })
  readonly status?: string;
}
