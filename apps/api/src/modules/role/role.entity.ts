import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { Status } from 'shared';

import { RoleType } from '@/constants';
import type { PermissionEntity } from '@/modules/permission/permission.entity';

@DatabaseEntity({ collection: 'roles' })
export class RoleEntity extends DatabaseEntityAbstract {
  @Prop({
    type: String,
    enum: RoleType,
    required: true,
    trim: true,
    maxlength: 50,
    unique: true,
  })
  name: RoleType;

  @Prop({
    trim: true,
    default: '',
    maxlength: 200,
  })
  description: string;

  @Prop({
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'PermissionEntity',
      },
    ],
    default: [],
  })
  permissions: PermissionEntity[];

  @Prop({
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}

export type RoleDocument = HydratedDocument<RoleEntity>;

export const RoleSchema = SchemaFactory.createForClass(RoleEntity);
