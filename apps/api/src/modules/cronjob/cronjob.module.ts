import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ArtworkEntity, ArtworkSchema } from '@/modules/artwork/artwork.entity';
import { ArtworkRepository } from '@/modules/artwork/artwork.repository';
import { MockupEntity, MockupSchema } from '@/modules/mockup/mockup.entity';
import { MockupRepository } from '@/modules/mockup/mockup.repository';
import { ProductEntity, ProductSchema } from '@/modules/product/product.entity';
import { FileEntity, FileSchema } from '@/modules/upload/file.entity';
import { FileRepository } from '@/modules/upload/file.repository';
import { SharedModule } from '@/shared/shared.module';

import { NotificationEntity, NotificationSchema } from '../notification/notification.entity';
import { NotificationRepository } from '../notification/notification.repository';
import { OrderEntity, OrderSchema } from '../order/order.entity';
import { OrderRepository } from '../order/order.repository';
import { UserEntity, UserSchema } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { CronjobController } from './cronjob.controller';
import { CronjobEntity, CronjobSchema } from './cronjob.entity';
import { CronjobRepository } from './cronjob.repository';
import { CronjobService } from './cronjob.service';
import { CronjobRunnerService } from './cronjob-runner.service';
import { DeleteImageJob, TelegramNotificationJob, TestJob } from './jobs';
import { DeleteNotificationJob } from './jobs/delete-notification';

@Global()
@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: CronjobEntity.name, schema: CronjobSchema }]),
    MongooseModule.forFeature([
      {
        name: ProductEntity.name,
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: FileEntity.name,
        schema: FileSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ArtworkEntity.name,
        schema: ArtworkSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: MockupEntity.name,
        schema: MockupSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: OrderEntity.name,
        schema: OrderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: NotificationEntity.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [CronjobController],
  exports: [CronjobService],
  providers: [
    TestJob,
    TelegramNotificationJob,
    DeleteImageJob,
    DeleteNotificationJob,
    ArtworkRepository,
    CronjobRepository,
    FileRepository,
    MockupRepository,
    NotificationRepository,
    OrderRepository,
    UserRepository,
    CronjobService,
    CronjobRunnerService,
  ],
})
export class CronjobModule {}
