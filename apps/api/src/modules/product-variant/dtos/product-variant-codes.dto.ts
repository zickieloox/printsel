import { ArrayField } from 'core';

export class ProductVariantCodesDto {
  @ArrayField({ type: String })
  codes: string[];
}
