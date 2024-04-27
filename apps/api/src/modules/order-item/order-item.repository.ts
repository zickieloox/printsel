import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { OrderItemDocument } from './order-item.entity';
import { OrderItemEntity } from './order-item.entity';

@Injectable()
export class OrderItemRepository extends DatabaseRepositoryAbstract<OrderItemEntity, OrderItemDocument> {
  constructor(
    @InjectModel(OrderItemEntity.name)
    private readonly orderItemModel: Model<OrderItemEntity>,
  ) {
    super(orderItemModel);
  }
}
