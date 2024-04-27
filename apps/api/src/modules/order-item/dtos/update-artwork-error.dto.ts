import { EnumField, StringFieldOptional } from 'core';

export enum UpdateArtworkType {
  UpdateArtwork = 'update-artwork',
  ErrorArtwork = 'error-artwork',
}

export class UpdateArtworkErrorDto {
  @StringFieldOptional()
  frontArtwork?: string;

  @StringFieldOptional()
  backArtwork?: string;

  @EnumField(() => UpdateArtworkType)
  type: UpdateArtworkType;
}
