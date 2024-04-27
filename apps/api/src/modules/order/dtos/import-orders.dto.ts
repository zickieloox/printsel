import { ArrayField, StringField, StringFieldOptional } from 'core';

export class ImportOrderItemDto {
  @StringField()
  externalId: string;

  @StringFieldOptional()
  shippingMethod?: string;

  @StringField()
  firstName: string;

  @StringField()
  lastName: string;

  @StringFieldOptional()
  email?: string;

  @StringFieldOptional()
  phone?: string;

  @StringField()
  country: string;

  @StringField()
  region: string;

  @StringField()
  addressLine1: string;

  @StringFieldOptional()
  addressLine2?: string;

  @StringField()
  city: string;

  @StringField()
  zip: string;

  @StringField()
  quantity: string;

  @StringField()
  variantId: string;

  @StringField()
  frontArtworkUrl: string;

  @StringFieldOptional()
  backArtworkUrl?: string;

  @StringFieldOptional()
  mockUpUrl1?: string;

  @StringFieldOptional()
  mockUpUrl2?: string;

  @StringField()
  storeCode: string;

  @StringFieldOptional()
  designerName: string;
}

export class ImportOrdersDto {
  @ArrayField({ type: ImportOrderItemDto })
  orders: ImportOrderItemDto[];
}
