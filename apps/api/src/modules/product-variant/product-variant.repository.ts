import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseRepositoryAbstract } from 'core';
import { Model } from 'mongoose';

import type { ProductVariantDocument } from './product-variant.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Injectable()
export class ProductVariantRepository extends DatabaseRepositoryAbstract<ProductVariantEntity, ProductVariantDocument> {
  constructor(
    @InjectModel(ProductVariantEntity.name)
    private readonly productVariantModel: Model<ProductVariantEntity>,
  ) {
    super(productVariantModel);
  }
}
