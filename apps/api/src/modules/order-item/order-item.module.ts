import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { ArtworkEntity, ArtworkSchema } from '../artwork/artwork.entity';
// import { ArtworkRepository } from '../artwork/artwork.repository';
// import { MockupEntity, MockupSchema } from '../mockup/mockup.entity';
// import { MockupRepository } from '../mockup/mockup.repository';
// import { NotificationEntity, NotificationSchema } from '../notification/notification.entity';
// import { NotificationRepository } from '../notification/notification.repository';
// import { NotificationService } from '../notification/notification.service';
import { OrderEntity, OrderSchema } from '../order/order.entity';
import { OrderRepository } from '../order/order.repository';
import { OrderItemController } from './order-item.controller';
import { OrderItemEntity, OrderItemSchema } from './order-item.entity';
import { OrderItemRepository } from './order-item.repository';
import { OrderItemService } from './order-item.service';
import { UploadModule } from '../upload/upload.module';
@Module({
  imports: [
    UploadModule,
    MongooseModule.forFeature([
      {
        name: OrderEntity.name,
        schema: OrderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: OrderItemEntity.name,
        schema: OrderItemSchema,
      },
    ]),
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService, OrderRepository, OrderItemRepository],
  exports: [OrderItemService],
})
export class OrderItemModule {}
