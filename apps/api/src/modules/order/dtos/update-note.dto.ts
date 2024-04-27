import { StringField } from 'core';

export class UpdateNoteDto {
  @StringField()
  note: string;
}
