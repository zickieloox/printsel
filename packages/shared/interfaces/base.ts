import { z } from 'zod';

export type BaseProps = {
  head: Head;
  isPublic?: boolean;
};
export type Head = {
  title: string;
  description: string;
};

const ResponseZodSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
  total: z.number().optional(),
});

export type Response = z.infer<typeof ResponseZodSchema>;

const BooleanResponseZodSchema = ResponseZodSchema.extend({
  data: z.boolean().optional(),
});

export type BooleanResponse = z.infer<typeof BooleanResponseZodSchema>;
