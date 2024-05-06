import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SharedModule } from '@/shared/shared.module';

import { MockupEntity, MockupSchema } from '../mockup/mockup.entity';
import { MockupRepository } from '../mockup/mockup.repository';
import { UserEntity, UserSchema } from '../user/user.entity';
import { ImageEntity, ImageSchema } from './image.entity';
import { ImageRepository } from './image.repository';
import { UniqueImageEntity, UniqueImageSchema } from './unique-image.entity';
import { UniqueImageRepository } from './unique-image.repository';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      {
        name: ImageEntity.name,
        schema: ImageSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: UniqueImageEntity.name,
        schema: UniqueImageSchema,
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
        name: MockupEntity.name,
        schema: MockupSchema,
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService, ImageRepository, UniqueImageRepository, MockupRepository],
  exports: [UploadService],
})
export class UploadModule {}
