import { EnumField, NumberField, StringField, StringFieldOptional } from 'core';
import { Status } from 'shared';

export class CreateProductVariantDto {
  @StringField()
  name: string;

  @StringFieldOptional()
  Id?: string;

  @StringFieldOptional()
  description?: string;

  @NumberField({ minimum: 1 })
  price: number;

  @NumberField({ minimum: 0 })
  quantity: number | null;

  @NumberField({ minimum: 1 })
  baseCost: number;

  @StringField()
  sku?: string;

  @StringFieldOptional()
  color?: string;

  @StringFieldOptional()
  size?: string;

  @StringFieldOptional()
  style?: string;

  @StringFieldOptional()
  isNew?: boolean;

  @EnumField(() => Status, {
    default: Status.Active,
  })
  status: Status;

  @StringFieldOptional()
  isEdited?: boolean;
}
