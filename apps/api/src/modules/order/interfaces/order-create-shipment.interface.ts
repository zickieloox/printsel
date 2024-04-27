import type { Types } from 'mongoose';

export interface IShipmentItem {
  name: string;
  product_id: Types.ObjectId;
  sku: string;
  quantity: number;
  price: number;
  currency: 'USD';
  weight?: number;
  height?: number;
  length?: number;
  width?: number;
}

export interface ICreateOrderShipment {
  shipping_info: {
    full_name?: string;
    address_1?: string;
    address_2?: string;
    company?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  order_id: Types.ObjectId;
  identifier: string;
  customer_note?: string;
  note?: string;
  accept_risk: boolean;
  shipping_provider?: string;
  shipping_method: 'EXPRESS';
  items: IShipmentItem[];
  custom_width?: number;
  custom_height?: number;
  custom_length?: number;
  custom_weight?: number;
}
