import { ArrayField, ArrayFieldOptional, EnumField, NumberField, StringField, StringFieldOptional } from 'core';
import { Status } from 'shared';

import type { UpdateProductVariantDto } from '@/modules/product-variant/dtos/update-product-variant.dto';

export class UpdateProductDto {
  @StringField()
  readonly title: string;

  @StringFieldOptional()
  readonly description?: string;

  @StringFieldOptional()
  readonly productCode?: string;

  @StringField()
  categoryId: string;

  @NumberField({
    min: 0,
  })
  price: number;

  @EnumField(() => Status, {
    default: Status.Active,
  })
  status?: string;

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

  @StringFieldOptional()
  personalization?: string;

  @ArrayFieldOptional()
  variants: UpdateProductVariantDto[];

  @ArrayFieldOptional()
  propertyOrder?: string[];
}
