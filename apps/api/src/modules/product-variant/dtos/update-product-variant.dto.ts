import { BooleanFieldOptional, EnumFieldOptional, NumberFieldOptional, StringFieldOptional } from 'core';
import { Status } from 'shared';

export class UpdateProductVariantDto {
  @StringFieldOptional()
  name?: string;

  @StringFieldOptional()
  description?: string;

  @NumberFieldOptional({ min: 0 })
  price?: number;

  @NumberFieldOptional({ min: 0 })
  baseCost?: number;

  @StringFieldOptional()
  sku?: string;

  @StringFieldOptional()
  color?: string;

  @StringFieldOptional()
  size?: string;

  @StringFieldOptional()
  style?: string;

  @EnumFieldOptional(() => Status)
  status?: Status;

  @BooleanFieldOptional()
  isEdited?: boolean;

  @StringFieldOptional()
  Id?: string;
}
