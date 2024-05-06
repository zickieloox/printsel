import { z } from 'zod';

import { ImageType, ResZod } from '..';
import { createZodDto } from '@anatine/zod-nestjs';

export const ResImageZod = z.object({
  _id: z.string(),
  name: z.string().optional(),
  url: z.string(),
  previewUrl: z.string(),
  thumbUrl: z.string().optional(),
});
export class ResImageDto extends createZodDto(ResImageZod) {}

//
export const UploadImageZod = z.object({
  type: z.nativeEnum(ImageType),
});
export class UploadImageDto extends createZodDto(UploadImageZod) {}
export const UploadImageResZod = ResZod.extend({
  data: ResImageZod,
});
export class UploadImageResDto extends createZodDto(UploadImageResZod) {}
