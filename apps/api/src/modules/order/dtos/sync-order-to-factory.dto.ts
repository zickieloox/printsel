import { DateFieldOptional } from 'core';

export class SyncOrderToFactoryDto {
  @DateFieldOptional()
  lastOrderUpdatedAt?: Date = new Date('2022-12-31T00:00:00.000Z');

  @DateFieldOptional()
  lastOrderItemUpdatedAt?: Date = new Date('2022-12-31T00:00:00.000Z');
}
