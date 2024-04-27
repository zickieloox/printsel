import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import { Status } from 'shared';
@DatabaseEntity({ collection: 'cronjobs' })
export class CronjobEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  code: string;

  @Prop({
    required: true,
    trim: true,
  })
  duration: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.INACTIVE,
  })
  status: Status;
}

export const CronjobSchema = SchemaFactory.createForClass(CronjobEntity);

export type CronjobDocument = HydratedDocument<CronjobEntity>;
