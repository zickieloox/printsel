import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import { Status } from 'shared';

import type { ImageDocument } from '../upload/unique-image.entity';
import type { UserDocument } from '../user/user.entity';

@DatabaseEntity({ collection: 'mockups' })
export class MockupEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
  })
  fileName: string;

  @Prop({
    required: true,
  })
  mimetype: string;

  @Prop({
    required: true,
  })
  size: number;

  @Prop({
    required: true,
  })
  width: number;

  @Prop({
    required: true,
  })
  height: number;

  @Prop({
    required: true,
  })
  dpi: number;

  @Prop({
    required: true,
  })
  url: number;

  @Prop({
    required: true,
  })
  previewUrl: number;

  @Prop({
    required: true,
  })
  thumbUrl: number;

  @Prop({
    required: true,
    ref: 'UniqueImageEntity',
  })
  imageId: string;

  @Prop({
    required: true,
    ref: 'UserEntity',
  })
  ownerId: string;

  @Prop({
    required: true,
    type: String,
    enum: Status,
    default: Status.Inactive,
  })
  status: Status;

  Image?: ImageDocument;

  Owner?: UserDocument;
}

export const MockupSchema = SchemaFactory.createForClass(MockupEntity);
MockupSchema.virtual('image', {
  ref: 'UniqueImageEntity',
  localField: 'imageId',
  foreignField: '_id',
  justOne: true,
});

MockupSchema.virtual('owner', {
  ref: 'UserEntity',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

export type MockupDocument = HydratedDocument<MockupEntity>;
