import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { FileDocument } from './file.entity';
import { FileEntity } from './file.entity';
@Injectable()
export class FileRepository extends DatabaseRepositoryAbstract<FileEntity, FileDocument> {
  constructor(
    @InjectModel(FileEntity.name)
    private readonly fileModel: Model<FileEntity>,
  ) {
    super(fileModel);
  }
}
