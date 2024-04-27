import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductEntity, ProductSchema } from '@/modules/product/product.entity';

import { ProductVariantController } from './product-variant.controller';
import { ProductVariantEntity, ProductVariantsSchema } from './product-variant.entity';
import { ProductVariantRepository } from './product-variant.repository';
import { ProductVariantService } from './product-variant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductVariantEntity.name,
        schema: ProductVariantsSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProductEntity.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, ProductVariantRepository],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
