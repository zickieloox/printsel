import { ID_LENGTH } from '@shared/constants';
import { z } from 'zod';

export const BaseEntityZod = z.object({
  _id: z.string().length(ID_LENGTH).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type BaseEntity = z.infer<typeof BaseEntityZod>;
