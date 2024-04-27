import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { UserDocument } from './user.entity';
import { UserEntity } from './user.entity';
@Injectable()
export class UserRepository extends DatabaseRepositoryAbstract<UserEntity, UserDocument> {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserEntity>,
  ) {
    super(userModel);
  }
}
