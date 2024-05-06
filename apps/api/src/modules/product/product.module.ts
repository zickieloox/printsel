import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductVariantEntity, ProductVariantsSchema } from '@/modules/product-variant/product-variant.entity';
import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';

import { CategoryEntity, CategorySchema } from '../category/category.entity';
import { CategoryRepository } from '../category/category.repository';
import { ImageEntity, ImageSchema } from '../upload/image.entity';
import { ImageRepository } from '../upload/image.repository';
import { ProductController } from './product.controller';
import { ProductEntity, ProductSchema } from './product.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        schema: CategorySchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProductEntity.name,
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProductVariantEntity.name,
        schema: ProductVariantsSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ImageEntity.name,
        schema: ImageSchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductVariantRepository, ImageRepository, CategoryRepository],
  exports: [ProductService],
})
export class ProductModule {}
