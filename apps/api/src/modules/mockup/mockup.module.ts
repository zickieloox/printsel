import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UniqueImageEntity, UniqueImageSchema } from '@/modules/upload/unique-image.entity';

import { MockupController } from './mockup.controller';
import { MockupEntity, MockupSchema } from './mockup.entity';
import { MockupRepository } from './mockup.repository';
import { MockupService } from './mockup.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UniqueImageEntity.name, schema: UniqueImageSchema }]),
    MongooseModule.forFeature([{ name: MockupEntity.name, schema: MockupSchema }]),
  ],
  controllers: [MockupController],
  exports: [MockupService],
  providers: [MockupService, MockupRepository],
})
export class MockupModule {}
