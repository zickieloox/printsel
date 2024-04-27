import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  DATABASE_CREATED_AT_FIELD_NAME,
  DATABASE_DELETED_AT_FIELD_NAME,
  DATABASE_UPDATED_AT_FIELD_NAME,
} from '@core/constants';

export abstract class DatabaseEntityAbstract {
  @Prop({
    type: Types.ObjectId,
    default: new Types.ObjectId(),
  })
  _id: Types.ObjectId;

  @Prop({
    required: false,
    index: true,
    type: Date,
  })
  [DATABASE_DELETED_AT_FIELD_NAME]?: Date;

  @Prop({
    required: false,
    index: 'asc',
    type: Date,
    // default: new Date(),
  })
  [DATABASE_CREATED_AT_FIELD_NAME]?: Date;

  @Prop({
    required: false,
    index: 'asc',
    type: Date,
    // default: new Date(),
  })
  [DATABASE_UPDATED_AT_FIELD_NAME]?: Date;
}
