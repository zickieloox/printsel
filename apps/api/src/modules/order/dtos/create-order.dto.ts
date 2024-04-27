import { ArrayField, ClassField, EnumFieldOptional, NumberField, StringField, StringFieldOptional } from 'core';
import { OrderStatus, OrderType } from 'shared';

export class ShippingDto {
  @StringField()
  firstName: string;

  @StringFieldOptional()
  lastName?: string;

  @StringFieldOptional()
  email?: string;

  @StringFieldOptional()
  phone?: string;

  @StringField()
  country: string;

  @StringFieldOptional()
  state?: string;

  @StringField()
  address1: string;

  @StringFieldOptional()
  address2?: string;

  @StringField()
  city: string;

  @StringField()
  zipCode: string;
}

export class LineItemDto {
  @StringField()
  productId: string;

  @StringField()
  variantId: string;

  @StringFieldOptional()
  mockup1?: string;

  @StringFieldOptional()
  mockup2?: string;

  @StringFieldOptional()
  frontArtwork?: string;

  @StringFieldOptional()
  backArtwork?: string;

  @NumberField()
  quantity: number;

  @StringFieldOptional()
  note?: string;
}

export class CreateOrderDto {
  @StringField({ minLength: 2 })
  externalId: string;

  @StringFieldOptional()
  storeCode: string;

  @StringFieldOptional()
  note?: string;

  @ClassField(() => ShippingDto)
  shipping: ShippingDto;

  @ArrayField()
  orderItems: LineItemDto[];

  @EnumFieldOptional(() => OrderType)
  type?: OrderType;

  @EnumFieldOptional(() => OrderStatus)
  defaultStatus?: OrderStatus;

  @StringFieldOptional()
  designerName?: string;
}
