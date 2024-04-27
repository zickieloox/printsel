import { Prop, raw, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import mongoose, { Types } from 'mongoose';
import { OrderItemStatus } from 'shared';

import type { OrderEntity } from '@/modules/order/order.entity';
import type { ProductEntity } from '@/modules/product/product.entity';
import type { ProductVariantEntity } from '@/modules/product-variant/product-variant.entity';

// import type { ArtworkEntity } from '../artwork/artwork.entity';
// import type { MockupEntity } from '../mockup/mockup.entity';

@DatabaseEntity({ collection: 'orderItems' })
export class OrderItemEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'OrderEntity',
  })
  order: OrderEntity | Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'ProductEntity',
  })
  product: ProductEntity | Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'ProductVariantEntity',
  })
  variant: ProductVariantEntity | Types.ObjectId;

  @Prop({
    unique: true,
    required: true,
  })
  barcode: string;

  @Prop({
    required: true,
  })
  quantity: number;

  @Prop({
    required: true,
    type: String,
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  // @Prop({
  //   type: mongoose.Types.ObjectId,
  //   ref: 'ArtworkEntity',
  // })
  // frontArtwork?: ArtworkEntity | Types.ObjectId;

  // @Prop({
  //   type: mongoose.Types.ObjectId,
  //   ref: 'ArtworkEntity',
  // })
  // backArtwork?: ArtworkEntity | Types.ObjectId;

  // @Prop({
  //   type: mongoose.Types.ObjectId,
  //   ref: 'MockupEntity',
  // })
  // mockup1?: MockupEntity | Types.ObjectId;

  // @Prop({
  //   type: mongoose.Types.ObjectId,
  //   ref: 'MockupEntity',
  // })
  // mockup2?: MockupEntity | Types.ObjectId;

  @Prop({
    trim: true,
  })
  reason?: string;

  @Prop({})
  subTotal: number;

  @Prop({})
  total: number;

  @Prop({})
  sellerNote?: string;

  @Prop({})
  systemNote?: string;

  @Prop({
    default: false,
  })
  isPaid: boolean;

  @Prop({
    required: true,
  })
  productTitle: string;

  @Prop({
    required: true,
  })
  productCode: string;

  @Prop({
    required: true,
  })
  variantCode: string;

  @Prop()
  variantSize?: string;

  @Prop()
  variantColor?: string;

  @Prop()
  variantStyle?: string;
}

export type OrderItemDocument = HydratedDocument<OrderItemEntity>;

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemEntity);
