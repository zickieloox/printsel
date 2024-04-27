import { ArrayField, StringField, StringFieldOptional } from 'core';

export class UpdateExternalFileLinkItemDto {
  @StringField()
  url: string;

  @StringFieldOptional()
  fileName?: string;
}

export class UpdateExternalFileLinkDto {
  @ArrayField({ type: UpdateExternalFileLinkItemDto })
  externalFileLinks: UpdateExternalFileLinkItemDto[];
}
