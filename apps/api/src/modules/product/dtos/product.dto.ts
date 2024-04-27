import { ArrayFieldOptional, EnumFieldOptional, NumberFieldOptional, StringField, StringFieldOptional } from 'core';
import { Types } from 'mongoose';
import { Status } from 'shared';

import type { ProductEntity } from '@/modules/product/product.entity';

class Variant {
  name?: string;

  price?: number;
}
export class ProductDto {
  @StringField()
  _id: Types.ObjectId;

  @StringField()
  title: string;

  @StringFieldOptional()
  productCode?: string;

  @EnumFieldOptional(() => Status, {
    default: Status.Active,
  })
  status?: string;

  @StringFieldOptional()
  category: string;

  @NumberFieldOptional()
  price?: number;

  @StringFieldOptional()
  mainImage?: string;

  @ArrayFieldOptional()
  otherImages?: string[];

  @ArrayFieldOptional({ type: Variant })
  variants?: Variant[];

  constructor(product: ProductEntity) {
    this._id = product._id;
    this.title = product.title;
    this.status = product.status;
    this.productCode = product.productCode;
  }
}
