import { BooleanFieldOptional, EnumFieldOptional } from 'core';

import { FileType } from '@/constants';

export class FileUploadDto {
  @EnumFieldOptional(() => FileType)
  type?: FileType;

  @BooleanFieldOptional()
  shouldUploadThumbnail?: boolean;
}
