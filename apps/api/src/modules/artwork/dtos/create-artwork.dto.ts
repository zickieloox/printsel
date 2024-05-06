import { NumberFieldOptional, StringFieldOptional } from 'core';

export class CreateArtworkDto {
  @StringFieldOptional({ maxLength: 40 })
  fileName: string;

  @StringFieldOptional({ maxLength: 40 })
  mimetype: string;

  @NumberFieldOptional()
  size: string;

  @NumberFieldOptional()
  width: string;

  @NumberFieldOptional()
  height: string;
}
