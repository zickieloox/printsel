import { z } from 'zod';

export const PageResZod = z.object({
  // success: z.boolean().optional().default(true),
  total: z.coerce.number().optional(),
  data: z.any().optional(),
});
