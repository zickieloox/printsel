import { ArrayField } from 'core';

export class PayOrdersDto {
  @ArrayField({ type: String })
  orderIds: string[];
}
