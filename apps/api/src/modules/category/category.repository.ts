import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { CategoryDocument } from '@/modules/category/category.entity';
import { CategoryEntity } from '@/modules/category/category.entity';
@Injectable()
export class CategoryRepository extends DatabaseRepositoryAbstract<CategoryEntity, CategoryDocument> {
  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryEntity>,
  ) {
    super(categoryModel);
  }
}
