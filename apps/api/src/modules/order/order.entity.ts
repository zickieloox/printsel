import { Prop, raw, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument, Types } from 'mongoose';
import type { IOrderStatusLog, IShippingEvent } from 'shared';
import { IOrderTracking, IShippingAddress, OrderStatus, OrderType, ShippingMethod, ShippingStatus } from 'shared';

import type { OrderItemEntity } from '@/modules/order-item/order-item.entity';
import { StoreEntity } from '@/modules/store/store.entity';
import { UserEntity } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'orders' })
export class OrderEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
  })
  externalId: string;

  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    type: raw({
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      zip: String,
      region: String,
      country: String,
    }),
    _id: false,
  })
  shippingAddress: IShippingAddress;

  @Prop({
    required: true,
    type: String,
    enum: ShippingMethod,
    default: ShippingMethod.STANDARD,
  })
  shippingMethod: ShippingMethod;

  @Prop({
    required: true,
    type: String,
    enum: OrderType,
    default: OrderType.MANUAL,
  })
  type: OrderType;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'StoreEntity',
  })
  store: StoreEntity;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'UserEntity',
  })
  user: UserEntity;

  @Prop({
    required: true,
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    required: true,
    default: 0,
    min: 0,
    max: 10,
  })
  priority: number;

  @Prop({
    type: [
      raw({
        date: Date,
        status: String,
      }),
    ],
    _id: false,
  })
  shippingEvents: IShippingEvent[];

  @Prop({
    required: true,
    type: String,
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  shippingStatus: ShippingStatus;

  @Prop({
    type: raw({
      trackingNumber: String,
      carrierName: String,
      carrierCode: String,
      trackingUrl: String,
      platformOrderUrl: String,
      shippingLabelUrl: String,
    }),
    _id: false,
  })
  tracking?: IOrderTracking;

  @Prop({
    required: true,
    default: [
      {
        date: new Date(),
        status: OrderStatus.PENDING,
        statusChanged: true,
      },
    ],
  })
  logs: IOrderStatusLog[];

  @Prop({
    required: true,
    type: [{ type: Types.ObjectId, ref: 'OrderItemEntity' }],
  })
  lineItems: OrderItemEntity[];

  @Prop({
    required: true,
    type: Boolean,
    default: false,
  })
  isPaid: boolean;

  @Prop({})
  subTotal: number;

  @Prop({})
  total: number;

  @Prop({})
  sellerNote?: string;

  @Prop({})
  systemNote?: string;

  @Prop({})
  designerName?: string;

  @Prop({})
  externalLink?: string;
}
export type OrderDocument = HydratedDocument<OrderEntity>;

export const OrderSchema = SchemaFactory.createForClass(OrderEntity);

OrderSchema.index({ externalId: 1, user: 1 }, { unique: true });
