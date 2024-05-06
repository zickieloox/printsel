import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import {
  ADDRESS_MAX_LENGTH,
  ADDRESS_MIN_LENGTH,
  CODE_LENGTH,
  ID_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
} from '@shared/constants';
import { Gender, Status } from '@shared/enums';

const TelegramConfigZod = z.object({
  telegramChannelId: z.string(),
  telegramBotToken: z.string(),
  isNotificationEnabled: z.boolean(),
});
export type TelegramConfig = z.infer<typeof TelegramConfigZod>;

//
export const UserZod = BaseEntityZod.extend({
  fullName: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  userCode: z.string().length(CODE_LENGTH),
  email: z.string().email(),
  phone: z.string().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH).optional(),
  balance: z.number().default(0),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  gender: z.nativeEnum(Gender).default(Gender.Male),
  birthday: z.date().optional(),
  address: z.string().min(ADDRESS_MIN_LENGTH).max(ADDRESS_MAX_LENGTH).optional(),
  otherPermissionIds: z.array(z.string().length(ID_LENGTH)).default([]),
  status: z.nativeEnum(Status).default(Status.Active),
  roleId: z.string().length(ID_LENGTH),
  secret: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  telegramConfig: TelegramConfigZod.optional(),
});
export type User = z.infer<typeof UserZod>;

//
export const GetUsersZod = PageQueryZod.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export class GetUsersDto extends createZodDto(extendApi(GetUsersZod)) {}
export const GetUsersResZod = PageResZod.extend({
  data: UserZod.array(),
});
export class GetUsersResDto extends createZodDto(extendApi(GetUsersResZod)) {}

//
export const UpdateUserZod = z.object({
  fullName: UserZod.shape.fullName.optional(),
  email: UserZod.shape.email.optional(),
  phone: UserZod.shape.phone.optional(),
  roleId: UserZod.shape.roleId.optional(),
  otherPermissionIds: UserZod.shape.otherPermissionIds,
  gender: UserZod.shape.gender.optional(),
  address: UserZod.shape.address.optional(),
});
export class UpdateUserDto extends createZodDto(extendApi(UpdateUserZod)) {}
export const UpdateUserResZod = ResZod.extend({
  data: UserZod,
});
export class UpdateUserResDto extends createZodDto(extendApi(UserZod)) {}

//
export const CreateUserZod = z.object({
  fullName: UserZod.shape.fullName,
  email: UserZod.shape.email,
  phone: UserZod.shape.phone.optional(),
  roleId: UserZod.shape.roleId,
  otherPermissionIds: UserZod.shape.otherPermissionIds,
  gender: UserZod.shape.gender.optional(),
  address: UserZod.shape.address.optional(),

  password: UserZod.shape.password,
});
export class CreateUserDto extends createZodDto(extendApi(CreateUserZod)) {}
export const CreateUserResZod = ResZod.extend({
  data: UserZod,
});
export class CreateUserResDto extends createZodDto(extendApi(CreateUserResZod)) {}

//
export const GetMeResZod = ResZod.extend({
  data: UserZod,
});
export class GetMeResDto extends createZodDto(extendApi(GetMeResZod)) {}

//
export const LoginZod = z.object({
  email: UserZod.shape.email,
  password: UserZod.shape.password,
  recaptchaToken: z.string(),
});
export class LoginDto extends createZodDto(extendApi(LoginZod)) {}
export const LoginResZod = z.object({
  userId: z.string(),
  accessToken: z.string(),
  user: UserZod,
  // refreshToken: z.string(),
});
export class LoginResDto extends createZodDto(extendApi(LoginResZod)) {}

// export const TokenPayloadZod = z.object({
//   expiresIn: z.number(),
//   accessToken: z.string(),
// });
