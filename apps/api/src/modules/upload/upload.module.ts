// upload.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { ArtworkEntity, ArtworkSchema } from '@/modules/artwork/artwork.entity';
// import { ArtworkRepository } from '@/modules/artwork/artwork.repository';
// import { MockupEntity, MockupSchema } from '@/modules/mockup/mockup.entity';
// import { MockupRepository } from '@/modules/mockup/mockup.repository';
import { UserEntity, UserSchema } from '@/modules/user/user.entity';
import { SharedModule } from '@/shared/shared.module';

import { FileEntity, FileSchema } from './file.entity';
import { FileRepository } from './file.repository';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      {
        name: FileEntity.name,
        schema: FileSchema,
      },
    ]),
    // MongooseModule.forFeature([
    //   {
    //     name: ArtworkEntity.name,
    //     schema: ArtworkSchema,
    //   },
    // ]),
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
    // MongooseModule.forFeature([
    //   {
    //     name: MockupEntity.name,
    //     schema: MockupSchema,
    //   },
    // ]),
  ],
  controllers: [UploadController],
  providers: [UploadService, FileRepository],
  exports: [UploadService, FileRepository],
})
export class UploadModule {}
