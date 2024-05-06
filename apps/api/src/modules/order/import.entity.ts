import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument, Types } from 'mongoose';
import { ImportStatus } from 'shared';

import { ImageType } from '@/constants';
import { UserEntity } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'imports' })
export class ImportEntity extends DatabaseEntityAbstract {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Number })
  fileSize: number;

  @Prop({ type: String, default: ImportStatus.PENDING })
  status: ImportStatus;

  @Prop({ required: true, type: String, enum: ImageType })
  type: ImageType;

  @Prop({ required: true, ref: 'UserEntity', type: Types.ObjectId })
  owner: UserEntity;
}

export type ImportDocument = HydratedDocument<ImportEntity>;

export const ImportSchema = SchemaFactory.createForClass(ImportEntity);
