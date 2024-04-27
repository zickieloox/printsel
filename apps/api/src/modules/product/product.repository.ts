import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { ProductDocument } from '@/modules/product/product.entity';
import { ProductEntity } from '@/modules/product/product.entity';
@Injectable()
export class ProductRepository extends DatabaseRepositoryAbstract<ProductEntity, ProductDocument> {
  constructor(
    @InjectModel(ProductEntity.name)
    private readonly productModel: Model<ProductEntity>,
  ) {
    super(productModel);
  }
}
