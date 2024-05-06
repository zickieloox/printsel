import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const PageQueryZod = z.object({
  page: z.coerce.number().transform(Number).default(1),
  limit: z.coerce.number().transform(Number).default(10),
  search: z.coerce.string().optional(),
});

export class PageQueryDto extends createZodDto(extendApi(PageQueryZod)) {}
