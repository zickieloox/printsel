/* eslint-disable @typescript-eslint/ban-types */
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import { type HydratedDocument, Types } from 'mongoose';
import { Status } from 'shared';

import { FileType } from '@/constants';
import { UserEntity } from '@/modules/user/user.entity';

@DatabaseEntity({ collection: 'files' })
export class FileEntity extends DatabaseEntityAbstract {
  @Prop({ required: true, type: String })
  key: string;

  @Prop({ type: String })
  fileId: string;

  @Prop({ required: true, type: String })
  mimeType: string;

  @Prop({ required: true, type: String })
  bucket: string;

  @Prop({ required: true, type: String })
  region: string;

  @Prop({ required: true, type: Number })
  fileSize: number;

  @Prop({ type: String })
  folder: string;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  heigh?: number;

  @Prop({ type: Number })
  dpi?: number;

  @Prop({ type: String })
  link: string;

  @Prop({ type: String })
  sha1: string;

  @Prop({ type: String, default: Status.INACTIVE })
  status: string;

  @Prop({ type: String })
  preview: string;

  @Prop({ type: String })
  previewFileId?: string;

  @Prop({ type: Number })
  previewWidth: number;

  @Prop({ type: Number })
  previewQuality: number;

  @Prop({ type: String })
  thumbnail: string;

  @Prop({ type: String })
  thumbnailFileId?: string;

  @Prop({ type: String })
  previewFolder: string;

  @Prop({ type: String })
  thumbnailFolder: string;

  @Prop({ type: Number })
  thumbnailWidth: number;

  @Prop({ type: Number })
  thumbnailQuality: number;

  @Prop({ required: true, type: String, enum: FileType })
  type: FileType;

  @Prop({ ref: 'UserEntity', type: Types.ObjectId })
  owner: UserEntity;

  parseImageUrls: Function;
}

export type FileDocument = HydratedDocument<FileEntity>;

export const FileSchema = SchemaFactory.createForClass(FileEntity);

FileSchema.methods.parseImageUrls = function () {
  if (this.preview && this.previewFolder) {
    if (this.preview.includes('http')) {
      return this.preview;
    }

    return `${process.env.CDN_URL}/${this.previewFolder}/${this.preview}`;
  } else if (this.key && this.folder) {
    return `${process.env.CDN_URL}/${this.folder}/${this.key}`;
  } else if (this.thumbnail && this.thumbnailFolder) {
    return `${process.env.CDN_URL}/${this.thumbnailFolder}/${this.thumbnail}`;
  }
};
