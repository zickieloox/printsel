import { StringFieldOptional } from 'core';

export class UpdateNoteDto {
  @StringFieldOptional()
  note?: string;
}
