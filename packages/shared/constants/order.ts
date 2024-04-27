export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrderStatus {
  NO_ARTWORK = 'no_artwork',
  PENDING = 'pending',
  PROCESSING = 'processing',
  IN_PRODUCTION = 'in_production',
  PRODUCED = 'produced',
  PACKAGED = 'packaged',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  PRE_TRANSIT = 'pre_transit',
  IN_TRANSIT = 'in_transit',
  PARTIALLY_DELIVERED = 'partially_delivered',
  DELIVERED = 'delivered',
  DONE = 'done',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
  ARTWORK_ERROR = 'artwork_error',
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPEDITED = 'expedited',
}

export enum OrderItemStatus {
  NO_ARTWORK = 'no_artwork',
  PENDING = 'pending',
  PROCESSING = 'processing',
  IN_PRODUCTION = 'in_production',
  PRODUCED = 'produced',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  PRE_TRANSIT = 'pre_transit',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DONE = 'done',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
  ARTWORK_ERROR = 'artwork_error',
}

export enum OrderType {
  MANUAL = 'manual',
  IMPORT = 'import',
  BULK = 'bulk',
}

export enum ShippingStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Picked Up',
  AWAITING = 'Awaiting',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  ADDRESS_ERROR = 'Address Error',
}

export const shippingStatusMapping = [
  { status: ShippingStatus.AWAITING, event: 'USPS Awaiting Item' },
  { status: ShippingStatus.ACCEPTED, event: 'USPS picked up item' },
  { status: ShippingStatus.IN_TRANSIT, event: 'Arrived' },
  { status: ShippingStatus.DELIVERED, event: 'delivered' },
];
