import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument, Types } from 'mongoose';
import { Status } from 'shared';

// import { CategoryEntity } from '@/modules/category/category.entity';
import type { ProductVariantEntity } from '@/modules/product-variant/product-variant.entity';
import { FileEntity } from '@/modules/upload/file.entity';
import { UserEntity } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'products' })
export class ProductEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  })
  productCode: string;

  @Prop({
    required: true,
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Prop({
    trim: true,
    index: true,
  })
  description?: string;

  // @Prop({
  //   type: Types.ObjectId,
  //   ref: 'CategoryEntity',
  // })
  // category: CategoryEntity;

  @Prop({
    required: true,
    type: Number,
  })
  price: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'FileEntity',
  })
  mainImage: FileEntity;

  @Prop({
    type: [Types.ObjectId],
    ref: 'FileEntity',
    default: [],
  })
  otherImages: FileEntity[];

  @Prop({
    required: true,
  })
  productionTime: string;

  @Prop({
    required: true,
  })
  shippingTime: string;

  @Prop()
  notes?: string;

  @Prop()
  personalization?: string;

  @Prop({
    type: [String],
    default: ['size', 'color', 'style'],
  })
  propertyOrder: string[];

  @Prop({
    type: [Types.ObjectId],
    default: [],
    ref: 'ProductVariantEntity',
  })
  variants: ProductVariantEntity[];

  @Prop({
    type: Types.ObjectId,
    ref: 'UserEntity',
    required: true,
  })
  createdBy: UserEntity;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserEntity',
    required: true,
  })
  updatedBy: UserEntity;
}

export type ProductDocument = HydratedDocument<ProductEntity>;

export const ProductSchema = SchemaFactory.createForClass(ProductEntity);
