import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { MockupDocument } from '@/modules/mockup/mockup.entity';
import { MockupEntity } from '@/modules/mockup/mockup.entity';
@Injectable()
export class MockupRepository extends DatabaseRepositoryAbstract<MockupEntity, MockupDocument> {
  constructor(
    @InjectModel(MockupEntity.name)
    private readonly mockupModel: Model<MockupEntity>,
  ) {
    super(mockupModel);
  }
}
