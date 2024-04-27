import type { SortOrder } from 'mongoose';
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from '..';

export class PageOptionsDto {
  readonly order: ENUM_PAGINATION_ORDER_DIRECTION_TYPE = ENUM_PAGINATION_ORDER_DIRECTION_TYPE.DESC;

  readonly page: number = 1;

  readonly limit: number = 10;

  readonly sort: string = 'updatedAt';

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get dbSort(): Record<string, SortOrder> {
    return {
      [this.sort]: this.order === ENUM_PAGINATION_ORDER_DIRECTION_TYPE.ASC ? 1 : -1,
    };
  }

  readonly search?: string;
}
