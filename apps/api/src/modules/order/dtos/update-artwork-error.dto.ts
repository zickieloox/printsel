import { StringField } from 'core';

export class UpdateArtworkError {
  @StringField()
  orderId: string;

  @StringField()
  orderItemId: string;
}
