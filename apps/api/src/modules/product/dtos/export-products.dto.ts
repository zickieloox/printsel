import { EnumField } from 'core';
import { any } from 'zod';
// import { ExportType } from 'shared';

export class ExportProductsDto {
  @EnumField(() => any)
  type: any;
}
