import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { OrderDocument } from '@/modules/order/order.entity';
import { OrderEntity } from '@/modules/order/order.entity';
@Injectable()
export class OrderRepository extends DatabaseRepositoryAbstract<OrderEntity, OrderDocument> {
  constructor(
    @InjectModel(OrderEntity.name)
    private readonly orderModel: Model<OrderEntity>,
  ) {
    super(orderModel);
  }
}
