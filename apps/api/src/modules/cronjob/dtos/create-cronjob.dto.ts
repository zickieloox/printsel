import { EnumFieldOptional, StringField } from 'core';
import { Status } from 'shared';

export class CreateCronjobDto {
  @StringField()
  readonly name: string;

  @StringField()
  readonly code: string;

  @StringField()
  readonly duration: string;

  @EnumFieldOptional(() => Status, {
    default: Status.Active,
  })
  readonly status?: string;
}
