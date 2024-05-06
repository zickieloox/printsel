export enum OrderStatus {
  NoArtwork = 'NoArtwork',
  Pending = 'Pending',
  OnHold = 'OnHold',
  Processing = 'Processing',
  InProduction = 'InProduction',
  Produced = 'Produced',
  Packaging = 'Packaging',
  PickupReady = 'PickupReady',
  PreTransit = 'PreTransit',
  InTransit = 'InTransit',
  PartiallyDelivered = 'PartiallyDelivered',
  Delivered = 'Delivered',
  Completed = 'Completed',

  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  PartiallyRefunded = 'PartiallyRefunded',
  Returned = 'Returned',
  ArtworkError = 'ArtworkError',
}

export enum ShippingMethod {
  Standard = 'Standard',
  Expedited = 'Expedited',
}

export enum OrderItemStatus {
  NoArtwork = 'NoArtwork',
  Pending = 'Pending',
  OnHold = 'OnHold',
  Processing = 'Processing',
  InProduction = 'InProduction',
  Produced = 'Produced',
  PickupReady = 'PickupReady',
  PreTransit = 'PreTransit',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Completed = 'Completed',

  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  PartiallyRefunded = 'PartiallyRefunded',
  Returned = 'Returned',
  ArtworkError = 'ArtworkError',
}

export enum OrderType {
  Manual = 'Manual',
  Import = 'Import',
  Bulk = 'Bulk',
}

export enum ShippingStatus {
  Pending = 'Pending',
  PickedUp = 'PickedUp',
  Awaiting = 'Awaiting',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  AddressError = 'AddressError',
}

export enum FulfillPlatform {
  OnosPod = 'OnosPod',
  BeeFun = 'BeeFun',
  // SwiftPod = 'SwiftPod',
}
