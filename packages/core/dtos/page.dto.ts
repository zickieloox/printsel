export class PageDto<T = unknown> {
  readonly data: T;

  readonly total: number;

  constructor(data: T, total: number) {
    this.data = data;
    this.total = total;
  }
}
