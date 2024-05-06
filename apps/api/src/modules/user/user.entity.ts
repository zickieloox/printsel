import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { assertSameType, DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { CallbackWithoutResultAndOptionalError, HydratedDocument } from 'mongoose';
import type { User } from 'shared';
import { CODE_LENGTH, Gender, ID_LENGTH, PASSWORD_MIN_LENGTH, Status, TelegramConfig } from 'shared';

import type { PermissionDocument } from '@/modules/permission/permission.entity';
import type { RoleDocument } from '@/modules/role/role.entity';

@DatabaseEntity({ collection: 'users' })
export class UserEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
  })
  fullName: string;

  @Prop({
    required: true,
    length: CODE_LENGTH,
  })
  userCode: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    // match: /^(0)?\d{9}$/,
    default: '',
  })
  phone?: string;

  @Prop({
    required: true,
    default: 0,
  })
  balance: number;

  @Prop({
    required: true,
    trim: true,
    minlength: PASSWORD_MIN_LENGTH,
    select: false,
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: Gender,
    default: Gender.Male,
  })
  gender: Gender;

  @Prop()
  birthday?: Date;

  @Prop()
  address?: string;

  @Prop({
    required: true,
    type: [
      {
        type: String,
        length: ID_LENGTH,
        ref: 'PermissionEntity',
      },
    ],
    default: [],
  })
  otherPermissionIds: string[];

  @Prop({
    required: true,
    type: String,
    enum: Status,
    default: 1,
  })
  status: Status;

  @Prop({ type: String, length: ID_LENGTH, ref: 'RoleEntity' })
  roleId: string;

  @Prop()
  secret?: string;

  @Prop()
  twoFactorEnabled?: boolean;

  @Prop({
    type: {
      telegramChannelId: String,
      telegramBotToken: String,
      isNotificationEnabled: Boolean,
    },
  })
  telegramConfig?: TelegramConfig;

  role?: RoleDocument;

  otherPermissions?: PermissionDocument[];
}

assertSameType<User, UserEntity>();
assertSameType<UserEntity, User>();

export const UserSchema = SchemaFactory.createForClass(UserEntity);
UserSchema.virtual('role', {
  ref: 'RoleEntity',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual('otherPermissions', {
  ref: 'RoleEntity',
  localField: 'otherPermissionIds',
  foreignField: '_id',
});

export type UserDocument = HydratedDocument<UserEntity>;

UserSchema.pre('save', function (next: CallbackWithoutResultAndOptionalError) {
  // eslint-disable-next-line no-invalid-this
  this.email = this.email.toLowerCase();
  next();
});
