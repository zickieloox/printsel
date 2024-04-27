import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import { PermissionAction } from 'core';
import { Status } from 'shared';

@DatabaseEntity({ collection: 'permissions' })
export class PermissionEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
    unique: true,
  })
  name: string;

  @Prop({
    trim: true,
    default: '',
    maxlength: 200,
  })
  description: string;

  @Prop({
    default: PermissionAction,
    enum: PermissionAction.VIEW,
  })
  action: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}

export type PermissionDocument = HydratedDocument<PermissionEntity>;

export const PermissionSchema = SchemaFactory.createForClass(PermissionEntity);
