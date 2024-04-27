import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductVariantEntity, ProductVariantsSchema } from '@/modules/product-variant/product-variant.entity';
import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';
import { FileEntity, FileSchema } from '@/modules/upload/file.entity';
import { FileRepository } from '@/modules/upload/file.repository';

import { ProductController } from './product.controller';
import { ProductEntity, ProductSchema } from './product.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   {
    //     name: CategoryEntity.name,
    //     schema: CategorySchema,
    //   },
    // ]),
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
        name: FileEntity.name,
        schema: FileSchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductVariantRepository, FileRepository],
  exports: [ProductService],
})
export class ProductModule {}
