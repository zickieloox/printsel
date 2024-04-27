import { z } from 'zod';
import { UserZod } from './user.entity';
import { PageQueryZod, PageResZod } from '@/types';

import { extendApi } from '@anatine/zod-openapi';
import { createZodDto } from '@anatine/zod-nestjs';

export const GetUsersZod = PageQueryZod.extend({
  fullName: UserZod.shape.fullName.optional(),
  userCode: UserZod.shape.userCode.optional(),
  email: UserZod.shape.email.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export const GetUsersResZod = PageResZod.extend({
  data: UserZod.array(),
});
export class GetUsersDto extends createZodDto(extendApi(GetUsersZod)) {}
export class GetUsersResDto extends createZodDto(extendApi(GetUsersResZod)) {}

export const UpdateUserZod = z.object({
  fullName: UserZod.shape.fullName.optional(),
  email: UserZod.shape.email.optional(),
  phone: UserZod.shape.phone.optional(),
  roleId: UserZod.shape.roleId.optional(),
  // otherPermissionIds: UserZod.shape.otherPermissionIds.optional(),
  gender: UserZod.shape.gender.optional(),
  address: UserZod.shape.address.optional(),
});
export const UpdateUserResZod = UserZod;
export class UpdateUserDto extends createZodDto(extendApi(UpdateUserZod)) {}
export class UpdateUserResDto extends createZodDto(extendApi(UserZod)) {}

export const CreateUserZod = z.object({
  fullName: UserZod.shape.fullName,
  email: UserZod.shape.email,
  phone: UserZod.shape.phone.optional(),
  roleId: UserZod.shape.roleId,
  // otherPermissionIds: UserZod.shape.otherPermissionIds.optional(),
  gender: UserZod.shape.gender.optional(),
  address: UserZod.shape.address.optional(),
});
export const CreateUserResZod = UserZod;
export class CreateUserDto extends createZodDto(extendApi(CreateUserZod)) {}
export class CreateUserResDto extends createZodDto(extendApi(CreateUserResZod)) {}

export const GetMeResZod = UserZod;
export class GetMeResDto extends createZodDto(extendApi(GetMeResZod)) {}

export const LoginZod = z.object({
  email: UserZod.shape.email,
  password: UserZod.shape.password,
  recaptchaToken: z.string(),
});
export const LoginResZod = z.object({
  userId: z.string(),
  accessToken: z.string(),
  user: UserZod,
  // refreshToken: z.string(),
});
export class LoginDto extends createZodDto(extendApi(LoginZod)) {}
export class LoginResDto extends createZodDto(extendApi(LoginResZod)) {}

// export const TokenPayloadZod = z.object({
//   expiresIn: z.number(),
//   accessToken: z.string(),
// });
