import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { BaseEntityZod, PageQueryZod, PageResZod, ResZod } from '@shared/types';
import {
  CODE_LENGTH,
  ID_LENGTH,
  MAX_PRODUCT_OPTION_LENGTH,
  NAME_MIN_LENGTH,
  NOTE_MAX_LENGTH,
  NOTE_MIN_LENGTH,
  PRICE_MAX,
  PRICE_MIN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '@shared/constants';
import { ResImageZod } from './upload.dto';
import { CreateProductVariantZod } from './product-variant.dto';
import { Status } from '../enums';

const ProductZod = BaseEntityZod.extend({
  title: z.string().min(TITLE_MIN_LENGTH).max(TITLE_MAX_LENGTH).trim(),
  code: z.string().min(NAME_MIN_LENGTH).max(CODE_LENGTH).trim().toUpperCase(),
  sku: z.string().min(NAME_MIN_LENGTH).max(CODE_LENGTH).trim().toUpperCase(),
  status: z.nativeEnum(Status).default(Status.Active),
  description: z.string(),
  categoryId: z.string(),
  price: z.number().min(PRICE_MIN).max(PRICE_MAX),
  imageIds: z.array(z.string().length(ID_LENGTH)),
  productionTimeStart: z.number(),
  productionTimeEnd: z.number(),
  shippingTimeStart: z.number(),
  shippingTimeEnd: z.number(),
  note: z.string().min(NOTE_MIN_LENGTH).max(NOTE_MAX_LENGTH).optional(),
  optionNames: z.array(z.string()).max(MAX_PRODUCT_OPTION_LENGTH).default([]),
  variantIds: z.array(z.string().length(ID_LENGTH)).default([]).optional(),
  createdById: z.string().length(ID_LENGTH),
  updatedById: z.string().length(ID_LENGTH),
});
export type Product = z.infer<typeof ProductZod>;

//
export const ResProductZod = ProductZod.extend({
  images: z.array(ResImageZod).optional(),
  category: z.string().optional(),
});

//
export const GetProductsZod = PageQueryZod;
export class GetProductsDto extends createZodDto(extendApi(GetProductsZod)) {}
export const GetProductsResZod = PageResZod.extend({
  data: ResProductZod.array(),
});
export class GetProductsResDto extends createZodDto(extendApi(GetProductsResZod)) {}

//
export const GetProductResZod = ResZod.extend({
  data: ResProductZod,
});
export class GetProductResDto extends createZodDto(extendApi(GetProductResZod)) {}

//
export const CreateProductZod = z.object({
  title: ProductZod.shape.title,
  sku: ProductZod.shape.sku,
  code: ProductZod.shape.code,
  description: ProductZod.shape.description,
  categoryId: ProductZod.shape.categoryId,
  price: ProductZod.shape.price,
  imageIds: ProductZod.shape.imageIds,
  productionTimeStart: ProductZod.shape.productionTimeStart,
  productionTimeEnd: ProductZod.shape.productionTimeEnd,
  shippingTimeStart: ProductZod.shape.shippingTimeStart,
  shippingTimeEnd: ProductZod.shape.shippingTimeEnd,
  note: ProductZod.shape.note,
  optionNames: ProductZod.shape.optionNames,
  status: ProductZod.shape.status,
  // variantIds: ProductZod.shape.variantIds,
  variants: z.array(CreateProductVariantZod),
});
export class CreateProductDto extends createZodDto(extendApi(CreateProductZod)) {}
export const CreateProductResZod = ResZod.extend({
  data: ProductZod,
});
export class CreateProductResDto extends createZodDto(extendApi(CreateProductResZod)) {}

//
export const UpdateProductZod = CreateProductZod.partial();
export class UpdateProductDto extends createZodDto(extendApi(UpdateProductZod)) {}
export const UpdateProductResZod = ResZod.extend({
  data: ProductZod,
});
export class UpdateProductResDto extends createZodDto(extendApi(UpdateProductResZod)) {}

//
export const DeleteProductResZod = ResZod.extend({
  data: ProductZod.nullable(),
});
export class DeleteProductResDto extends createZodDto(extendApi(DeleteProductResZod)) {}
