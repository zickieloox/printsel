import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { assertSameType, DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument } from 'mongoose';
import type { Product } from 'shared';
import { ID_LENGTH, Status } from 'shared';

import type { CategoryDocument } from '../category/category.entity';
import type { ProductVariantDocument } from '../product-variant/product-variant.entity';
import type { ImageDocument } from '../upload/image.entity';
import type { UserDocument } from '../user/user.entity';

@DatabaseEntity({ collection: 'products' })
export class ProductEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  })
  code: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  })
  sku: string;

  @Prop({
    required: true,
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Prop()
  description: string;

  @Prop({
    type: String,
    ref: 'CategoryEntity',
  })
  categoryId: string;

  @Prop({
    required: true,
    type: Number,
  })
  price: number;

  @Prop({
    required: true,
    type: [String],
    ref: 'ImageEntity',
  })
  imageIds: string[];

  @Prop({
    required: true,
  })
  productionTimeStart: number;

  @Prop({
    required: true,
  })
  productionTimeEnd: number;

  @Prop({
    required: true,
  })
  shippingTimeStart: number;

  @Prop({
    required: true,
  })
  shippingTimeEnd: number;

  @Prop()
  note?: string;

  @Prop({
    type: [String],
    default: [],
  })
  optionNames: string[];

  @Prop({
    type: [String],
    default: [],
    ref: 'ProductVariantEntity',
  })
  variantIds?: string[];

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
}

assertSameType<Product, ProductEntity>();
assertSameType<ProductEntity, Product>();

export const ProductSchema = SchemaFactory.createForClass(ProductEntity);
ProductSchema.virtual('category', {
  ref: 'CategoryEntity',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.virtual('images', {
  ref: 'ImageEntity',
  localField: 'imageIds',
  foreignField: '_id',
});

ProductSchema.virtual('variants', {
  ref: 'ProductVariantEntity',
  localField: 'variantIds',
  foreignField: '_id',
});

ProductSchema.virtual('createdBy', {
  ref: 'UserEntity',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.virtual('updatedBy', {
  ref: 'UserEntity',
  localField: 'updatedById',
  foreignField: '_id',
  justOne: true,
});

export type ProductDocument = HydratedDocument<ProductEntity> & {
  variants?: ProductVariantDocument[];
  images?: ImageDocument[];
  category?: CategoryDocument;
  createdBy?: UserDocument;
  updatedBy?: UserDocument;
};
