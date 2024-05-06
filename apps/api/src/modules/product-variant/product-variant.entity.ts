import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { assertSameType, DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import type { ProductVariant } from 'shared';
import { ID_LENGTH, Status } from 'shared';

import type { UserDocument } from '../user/user.entity';

@DatabaseEntity({ collection: 'productVariants' })
export class ProductVariantEntity extends DatabaseEntityAbstract {
  @Prop({
    length: ID_LENGTH,
    required: true,
    ref: 'ProductEntity',
  })
  productId: string;

  @Prop({
    trim: true,
  })
  title?: string;

  @Prop({
    required: true,
    unique: true,
  })
  code: string;

  @Prop()
  description?: string;

  @Prop({
    type: Number,
    default: null,
  })
  quantity: number | null;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    required: true,
    min: 0,
  })
  baseCost: number;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  sku: string;

  @Prop()
  option1: string;

  @Prop()
  option2?: string;

  @Prop()
  option3?: string;

  @Prop()
  option4?: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Prop()
  note?: string;

  @Prop({
    required: true,
    length: ID_LENGTH,
    ref: 'UserEntity',
  })
  createdById: string;

  @Prop({
    required: true,
    length: ID_LENGTH,
    ref: 'UserEntity',
  })
  updatedById: string;

  createdBy?: UserDocument;

  updatedBy?: UserDocument;
}

assertSameType<ProductVariant, ProductVariantEntity>();
assertSameType<ProductVariantEntity, ProductVariant>();

export const ProductVariantsSchema = SchemaFactory.createForClass(ProductVariantEntity);
ProductVariantsSchema.virtual('createdBy', {
  ref: 'UserEntity',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true,
});

ProductVariantsSchema.virtual('updatedBy', {
  ref: 'UserEntity',
  localField: 'updatedById',
  foreignField: '_id',
  justOne: true,
});

export type ProductVariantDocument = HydratedDocument<ProductVariantEntity>;
