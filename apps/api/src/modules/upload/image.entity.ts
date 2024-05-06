import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument } from 'mongoose';
import { ID_LENGTH, ImageType, Status } from 'shared';

import type { UserDocument } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'images' })
export class ImageEntity extends DatabaseEntityAbstract {
  @Prop({ required: true, index: true, type: String, enum: ImageType })
  type: ImageType;

  @Prop({ required: true, length: ID_LENGTH, ref: 'UserEntity' })
  ownerId: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  bucket: string;

  @Prop({ required: true, unique: false })
  sha1: string;

  @Prop({ required: true, index: true, type: String, enum: Status, default: Status.Inactive })
  status: Status;

  @Prop({ required: true })
  fileName: string;

  // original
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  objectId: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  dpi: number;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileSize: number;

  // preview
  @Prop({ required: true })
  previewKey: string;

  @Prop({ required: true })
  previewObjectId: string;

  @Prop({ required: true })
  previewWidth: number;

  @Prop({ required: true })
  previewHeight: number;

  @Prop({ required: true })
  previewQuality: number;

  @Prop({ required: true })
  previewUrl: string;

  @Prop({ required: true })
  previewFileSize: number;

  // thumbnail
  @Prop()
  thumbKey?: string;

  @Prop()
  thumbObjectId?: string;

  @Prop()
  thumbWidth?: number;

  @Prop()
  thumbHeight?: number;

  @Prop()
  thumbQuality?: number;

  @Prop()
  thumbUrl?: string;

  @Prop()
  thumbFileSize?: number;
}

export const ImageSchema = SchemaFactory.createForClass(ImageEntity);
ImageSchema.virtual('owner', {
  ref: 'UserEntity',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

ImageSchema.virtual('owner', {
  ref: 'UserEntity',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

ImageSchema.methods.parseUrls = function () {
  if (this.url && !this.previewUrl.includes('http')) {
    this.url = `${process.env.CDN_URL}/${this.url}`;
  }

  if (this.previewUrl && !this.previewUrl.includes('http')) {
    this.previewUrl = `${process.env.CDN_URL}/${this.previewUrl}`;
  }

  if (this.thumbUrl && !this.thumbUrl.includes('http')) {
    this.thumbUrl = `${process.env.CDN_URL}/${this.thumbUrl}`;
  }
};

export type ImageDocument = HydratedDocument<ImageEntity> & {
  parseUrls(): void;
  owner?: UserDocument;
};
