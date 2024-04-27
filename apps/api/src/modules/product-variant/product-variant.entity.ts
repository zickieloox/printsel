import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { Status } from 'shared';

import { UserEntity } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'productVariants' })
export class ProductVariantEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    unique: true,
  })
  code: string;

  @Prop({
    trim: true,
  })
  description: string;

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
    trim: true,
    uppercase: true,
  })
  sku: string;

  @Prop({
    trim: true,
    default: 'Single',
  })
  color: string;

  @Prop({
    trim: true,
    default: 'Single',
  })
  size: string;

  @Prop({
    trim: true,
    default: 'Single',
  })
  style: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Prop({
    type: new Object({
      _id: mongoose.Types.ObjectId,
      email: String,
    }),
    ref: 'UserEntity',
    default: null,
  })
  createdBy: UserEntity;

  @Prop({
    type: new Object({
      _id: mongoose.Types.ObjectId,
      email: String,
    }),
    ref: 'UserEntity',
    default: null,
  })
  updatedBy: UserEntity;
}

export type ProductVariantDocument = HydratedDocument<ProductVariantEntity>;

export const ProductVariantsSchema = SchemaFactory.createForClass(ProductVariantEntity);
