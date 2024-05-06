import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { assertSameType, DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
import type { Category } from 'shared';
import { ID_LENGTH } from 'shared';

import type { ImageDocument } from '@/modules/upload/unique-image.entity';

@DatabaseEntity({ collection: 'categories' })
export class CategoryEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  code: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
    type: String,
    length: ID_LENGTH,
    ref: 'UniqueImageEntity',
  })
  imageId?: string;

  @Prop({
    type: String,
    length: ID_LENGTH,
    ref: 'CategoryEntity',
  })
  parentId?: string;

  image?: ImageDocument;

  parent?: CategoryDocument;

  children?: CategoryDocument[];
}

assertSameType<Category, CategoryEntity>();
assertSameType<CategoryEntity, Category>();

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);
CategorySchema.virtual('parent', {
  ref: 'CategoryEntity',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

CategorySchema.virtual('children', {
  ref: 'CategoryEntity',
  localField: '_id',
  foreignField: 'parentId',
});

export type CategoryDocument = HydratedDocument<CategoryEntity>;
