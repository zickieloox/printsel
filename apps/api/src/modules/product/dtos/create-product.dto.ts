import { ArrayField, ArrayFieldOptional, EnumField, NumberField, StringField, StringFieldOptional } from 'core';
import { Status } from 'shared';

import type { CreateProductVariantDto } from '@/modules/product-variant/dtos/create-product-variant.dto';

export class CreateProductDto {
  @StringField()
  title: string;

  @StringFieldOptional()
  description?: string;

  @StringField()
  productCode: string;

  @StringField()
  categoryId: string;

  @NumberField({ min: 0 })
  price: number;

  @EnumField(() => Status, {
    default: Status.Active,
  })
  status: Status;

  @StringField()
  mainImageId: string;

  @ArrayField()
  otherImageIds: string[];

  @StringFieldOptional()
  productionTime?: string;

  @StringFieldOptional()
  shippingTime?: string;

  @StringFieldOptional()
  notes?: string;

  @ArrayFieldOptional({ type: Array })
  variants: CreateProductVariantDto[];
}
