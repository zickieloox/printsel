import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { CallbackWithoutResultAndOptionalError, HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';
import { Gender, Status } from 'shared';

import type { PermissionDocument } from '@/modules/permission/permission.entity';
import { RoleDocument } from '@/modules/role/role.entity';
import { z } from 'zod';

const TelegramConfigZod = z.object({
  telegramChannelId: z.string(),
  telegramBotToken: z.string(),
  isNotificationEnabled: z.boolean(),
});

export type TelegramConfig = z.infer<typeof TelegramConfigZod>;

export const UserZod = z.object({
  _id: z.string(),

  fullName: z.string().min(2).max(60),
  userCode: z.string().length(8),
  email: z.string().email(),
  phone: z.string().optional(),
  balance: z.number().default(0),
  password: z.string().min(8),
  gender: z.nativeEnum(Gender).default(Gender.MALE),
  birthday: z.date().optional(),
  address: z.string().min(2).max(60).optional(),
  otherPermissionIds: z.array(z.string()).default([]),
  status: z.nativeEnum(Status).default(Status.Active),
  roleId: z.string(),
  secret: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  telegramConfig: TelegramConfigZod.optional(),
});

export type User = z.infer<typeof UserZod>;

@DatabaseEntity({ collection: 'users' })
export class UserEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  })
  fullName: string;

  @Prop({
    required: true,
    length: 8,
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
    minlength: 8,
    select: false,
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: Gender,
    default: Gender.MALE,
  })
  gender: Gender;

  @Prop()
  birthday?: Date;

  @Prop({
    trim: true,
    // minlength: 2,
    maxlength: 60,
  })
  address?: string;

  @Prop({
    required: true,
    type: [
      {
        type: Types.ObjectId,
        ref: 'PermissionEntity',
      },
    ],
    default: [],
  })
  otherPermissionIds: string[];

  @Prop({
    required: true,
    type: Number,
    enum: Status,
    default: 1,
  })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: 'RoleEntity' })
  roleId: Types.ObjectId | string;

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

// assertSameType<User, UserEntity>();
// assertSameType<UserEntity, User>();

export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = HydratedDocument<UserEntity>;

UserSchema.pre('save', function (next: CallbackWithoutResultAndOptionalError) {
  // eslint-disable-next-line no-invalid-this
  this.email = this.email.toLowerCase();
  next();
});
