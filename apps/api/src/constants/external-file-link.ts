import type { UpdateExternalFileLinkItemDto } from '@/modules/order-item/dtos/update-external-file-link.dto';

export interface IExternalFileLinkPromise extends UpdateExternalFileLinkItemDto {
  success: boolean;
  message: string;
}
