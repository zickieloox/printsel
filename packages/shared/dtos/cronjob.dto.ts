import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import { CODE_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@shared/constants';

export const CronJobZod = BaseEntityZod.extend({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).trim(),
  code: z.string().length(CODE_LENGTH).trim().toUpperCase(),
  description: z.string().trim().optional(),
});
export type CronJob = z.infer<typeof CronJobZod>;

//
export const CreateCronJobZod = z.object({
  name: CronJobZod.shape.name,
  code: CronJobZod.shape.code,
  description: CronJobZod.shape.description.optional(),
});
export class CreateCronJobDto extends createZodDto(extendApi(CreateCronJobZod)) {}
export const CreateCronJobResZod = ResZod.extend({
  data: CronJobZod,
});
export class CreateCronJobResDto extends createZodDto(extendApi(CreateCronJobResZod)) {}

//
export const GetCategoriesZod = PageQueryZod;
export class GetCategoriesDto extends createZodDto(extendApi(GetCategoriesZod)) {}
export const GetCategoriesResZod = PageResZod.extend({
  data: CronJobZod.array(),
});
export class GetCategoriesResDto extends createZodDto(extendApi(GetCategoriesResZod)) {}

//
export const UpdateCronJobZod = z.object({
  name: CronJobZod.shape.name.optional(),
  code: CronJobZod.shape.code.optional(),
  description: CronJobZod.shape.description.optional(),
});
export class UpdateCronJobDto extends createZodDto(extendApi(UpdateCronJobZod)) {}
export const UpdateCronJobResZod = ResZod.extend({
  data: CronJobZod,
});
export class UpdateCronJobResDto extends createZodDto(extendApi(UpdateCronJobResZod)) {}

//
export const DeleteCronJobResZod = ResZod.extend({
  data: CronJobZod.nullable(),
});
export class DeleteCronJobResDto extends createZodDto(extendApi(DeleteCronJobResZod)) {}
