import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import { RoleType, Status } from '@shared/enums';
import { DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, ID_LENGTH } from '..';

export const RoleZod = BaseEntityZod.extend({
  name: z.nativeEnum(RoleType),
  description: z.string().min(DESCRIPTION_MIN_LENGTH).max(DESCRIPTION_MAX_LENGTH).optional(),
  permissionIds: z.array(z.string().length(ID_LENGTH)).default([]),
  status: z.nativeEnum(Status).default(Status.Active),
});
export type Role = z.infer<typeof RoleZod>;

//
export const GetRolesZod = PageQueryZod.extend({
  status: RoleZod.shape.status.optional(),
});
export class GetRolesDto extends createZodDto(extendApi(GetRolesZod)) {}
export const GetRolesResZod = PageResZod.extend({
  data: RoleZod.array(),
});
export class GetRolesResDto extends createZodDto(extendApi(GetRolesResZod)) {}

//
export const CreateRoleZod = z.object({
  name: RoleZod.shape.name,
  description: RoleZod.shape.description,
  permissionIds: RoleZod.shape.permissionIds,
  status: RoleZod.shape.status,
});
export class CreateRoleDto extends createZodDto(extendApi(CreateRoleZod)) {}
export const CreateRoleResZod = ResZod.extend({
  data: RoleZod,
});
export class CreateRoleResDto extends createZodDto(extendApi(CreateRoleResZod)) {}

//
export const UpdateRoleZod = z.object({
  name: RoleZod.shape.name.optional(),
  description: RoleZod.shape.description.optional(),
  permissionIds: RoleZod.shape.permissionIds.optional(),
  status: RoleZod.shape.status.optional(),
});
export class UpdateRoleDto extends createZodDto(extendApi(UpdateRoleZod)) {}
export const UpdateRoleResZod = ResZod.extend({
  data: RoleZod,
});
export class UpdateRoleResDto extends createZodDto(extendApi(UpdateRoleResZod)) {}
