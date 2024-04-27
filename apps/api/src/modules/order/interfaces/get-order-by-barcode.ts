import type { Types } from 'mongoose';

import type { OrderEntity } from '../order.entity';

export interface IGetOrderDetailByBarcodeResponse extends OrderEntity {
  targetOrderItemId?: Types.ObjectId;
  targetPieceOrderId?: Types.ObjectId;
}
