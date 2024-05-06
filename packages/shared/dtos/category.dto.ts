import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import { CODE_LENGTH, ID_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@shared/constants';

export const CategoryZod = BaseEntityZod.extend({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).trim(),
  code: z.string().length(CODE_LENGTH).trim().toUpperCase(),
  description: z.string().trim().optional(),
  imageId: z.string().length(ID_LENGTH).optional(),
  parentId: z.string().length(ID_LENGTH).optional(),
});
export type Category = z.infer<typeof CategoryZod>;

//
export const CreateCategoryZod = z.object({
  name: CategoryZod.shape.name,
  code: CategoryZod.shape.code,
  description: CategoryZod.shape.description,
  parentId: CategoryZod.shape.parentId,
});
export class CreateCategoryDto extends createZodDto(extendApi(CreateCategoryZod)) {}
export const CreateCategoryResZod = ResZod.extend({
  data: CategoryZod,
});
export class CreateCategoryResDto extends createZodDto(extendApi(CreateCategoryResZod)) {}

//
export const GetCategoriesZod = PageQueryZod;
export class GetCategoriesDto extends createZodDto(extendApi(GetCategoriesZod)) {}
export const GetCategoriesResZod = PageResZod.extend({
  data: CategoryZod.array(),
});
export class GetCategoriesResDto extends createZodDto(extendApi(GetCategoriesResZod)) {}

//
export const UpdateCategoryZod = CreateCategoryZod.partial();
export class UpdateCategoryDto extends createZodDto(extendApi(UpdateCategoryZod)) {}
export const UpdateCategoryResZod = ResZod.extend({
  data: CategoryZod,
});
export class UpdateCategoryResDto extends createZodDto(extendApi(UpdateCategoryResZod)) {}

//
export const DeleteCategoryResZod = ResZod.extend({
  data: CategoryZod.nullable(),
});
export class DeleteCategoryResDto extends createZodDto(extendApi(DeleteCategoryResZod)) {}
