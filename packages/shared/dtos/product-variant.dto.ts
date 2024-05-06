import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import {
  CODE_LENGTH,
  ID_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NOTE_MAX_LENGTH,
  NOTE_MIN_LENGTH,
  PRICE_MAX,
  PRICE_MIN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '@shared/constants';
import { Status } from '..';

const ProductVariantZod = BaseEntityZod.extend({
  productId: z.string().length(ID_LENGTH),
  title: z.string().min(TITLE_MIN_LENGTH).max(TITLE_MAX_LENGTH).trim().optional(),
  code: z.string().length(CODE_LENGTH).trim().toUpperCase(),
  sku: z.string().min(NAME_MIN_LENGTH).max(CODE_LENGTH).trim().toUpperCase(),
  status: z.nativeEnum(Status).default(Status.Active),
  description: z.string().optional(),
  quantity: z.number().nullable(),
  price: z.number().min(PRICE_MIN).max(PRICE_MAX),
  baseCost: z.number().min(PRICE_MIN).max(PRICE_MAX),
  option1: z.string(),
  option2: z.string().optional(),
  option3: z.string().optional(),
  option4: z.string().optional(),
  note: z.string().min(NOTE_MIN_LENGTH).max(NOTE_MAX_LENGTH).optional(),
  createdById: z.string().length(ID_LENGTH),
  updatedById: z.string().length(ID_LENGTH),
});
export type ProductVariant = z.infer<typeof ProductVariantZod>;

//
export const ProductVariantResZod = ResZod.extend({
  data: ProductVariantZod,
});
export class ProductVariantResDto extends createZodDto(extendApi(ProductVariantResZod)) {}

//
export const GetProductVariantsZod = PageQueryZod;
export class GetProductVariantsDto extends createZodDto(extendApi(GetProductVariantsZod)) {}
export const GetProductVariantsResZod = PageResZod.extend({
  data: ProductVariantZod.array(),
});
export class GetProductVariantsResDto extends createZodDto(extendApi(GetProductVariantsResZod)) {}

//
export const CreateProductVariantZod = z.object({
  title: ProductVariantZod.shape.title,
  sku: ProductVariantZod.shape.sku.optional(),
  description: ProductVariantZod.shape.description,
  quantity: ProductVariantZod.shape.quantity,
  price: ProductVariantZod.shape.price,
  note: ProductVariantZod.shape.note,
});
export class CreateProductVariantDto extends createZodDto(extendApi(CreateProductVariantZod)) {}
export const CreateProductVariantResZod = ResZod.extend({
  data: ProductVariantZod,
});
export class CreateProductVariantResDto extends createZodDto(extendApi(CreateProductVariantResZod)) {}

//
// export const UpdateProductVariantZod = CreateProductVariantZod.partial();
// export class UpdateProductVariantDto extends createZodDto(extendApi(UpdateProductVariantZod)) {}
// export const UpdateProductVariantResZod = ResZod.extend({
//   data: ProductVariantZod,
// });
// export class UpdateProductVariantResDto extends createZodDto(extendApi(UpdateProductVariantResZod)) {}

//
export const DeleteProductVariantResZod = ResZod.extend({
  data: ProductVariantZod.nullable(),
});
export class DeleteProductVariantResDto extends createZodDto(extendApi(DeleteProductVariantResZod)) {}

//
export const GetProductVariantsByCodesZod = z.object({
  codes: z.array(z.string().length(CODE_LENGTH)).min(1),
});
export class GetProductVariantsByCodesDto extends createZodDto(extendApi(GetProductVariantsByCodesZod)) {}
export const GetProductVariantsByCodesResZod = ResZod.extend({
  data: z.object({
    existing: ProductVariantZod.array(),
    nonExisting: z.array(z.string().length(CODE_LENGTH)),
  }),
});
export class GetProductVariantsByCodesResDto extends createZodDto(extendApi(GetProductVariantsByCodesResZod)) {}
