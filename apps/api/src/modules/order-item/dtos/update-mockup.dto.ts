import { StringFieldOptional } from 'core';

export class UpdateMockupDto {
  @StringFieldOptional()
  mockup1?: string;

  @StringFieldOptional()
  mockup2?: string;
}
