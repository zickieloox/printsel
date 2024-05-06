import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ImageEntity, ImageSchema } from '../upload/image.entity';
import { ImageRepository } from '../upload/image.repository';
import { ArtworkController } from './artwork.controller';
import { ArtworkService } from './artwork.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ImageEntity.name, schema: ImageSchema }])],
  controllers: [ArtworkController],
  exports: [ArtworkService],
  providers: [ArtworkService, ImageRepository],
})
export class ArtworkModule {}
