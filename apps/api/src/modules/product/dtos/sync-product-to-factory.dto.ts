import { DateFieldOptional } from 'core';

export class SyncProductToFactoryDto {
  @DateFieldOptional()
  latestProductUpdatedAt?: Date = new Date('2022-12-31T00:00:00.000Z');

  @DateFieldOptional()
  latestProductVariantUpdatedAt?: Date = new Date('2022-12-31T00:00:00.000Z');

  @DateFieldOptional()
  latestCategoryUpdatedAt?: Date = new Date('2022-12-31T00:00:00.000Z');
}
