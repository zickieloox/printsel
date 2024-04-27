import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDto<T = unknown> {
  readonly success: boolean;

  @ApiPropertyOptional()
  readonly data?: T;

  readonly message?: string;

  constructor(data: T, success = true, message?: string) {
    this.data = data;
    this.success = success;
    this.message = message ?? 'Success';
  }
}
