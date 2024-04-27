import type { PageDto } from './page.dto';
import { ResponseDto } from './response.dto';

export class PageResponseDto<T = unknown> extends ResponseDto<T> {
  readonly total: number;

  constructor(pageDto: PageDto<T>, success = true, message?: string) {
    super(pageDto.data, success, message);
    this.total = pageDto.total;
  }
}
