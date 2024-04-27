import { BadRequestException, Injectable } from '@nestjs/common';
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from 'shared';

import type { ProductVariantCodesDto } from './dtos/product-variant-codes.dto';
import type { ProductVariantEntity } from './product-variant.entity';
import { ProductVariantRepository } from './product-variant.repository';

@Injectable()
export class ProductVariantService {
  constructor(private productVariantRepository: ProductVariantRepository) {}

  async getAllProductVariants(): Promise<ProductVariantEntity[]> {
    return await this.productVariantRepository.findAll(
      {},
      {
        sort: { createdAt: ENUM_PAGINATION_ORDER_DIRECTION_TYPE.DESC },
        select: ['_id', 'name', 'color', 'style', 'size', 'sku', 'code', 'price'],
      },
    );
  }

  async getProductVariant(variantId: string): Promise<ProductVariantEntity> {
    const productVariant = await this.productVariantRepository.findOneById(variantId);

    if (!productVariant) {
      throw new BadRequestException('Product variant not found');
    }

    return productVariant;
  }

  async getProductVariantsByCodes(
    productVariantIds: ProductVariantCodesDto,
  ): Promise<Array<{ id: string; data?: unknown }>> {
    const { codes } = productVariantIds;
    const uniqueProductVariantCodes = [...new Set(codes)];

    const existingProductVariants = await this.productVariantRepository.findAll(
      { code: { $in: uniqueProductVariantCodes } },
      { select: ['_id', 'name', 'color', 'style', 'size', 'code'] },
    );

    const existingIds = new Set(existingProductVariants.map((variant) => variant.code));
    const productVariantsWithId = existingProductVariants.map((item) => {
      const newItem = {
        ...item,
        _id: item.code,
      };

      return { id: item.code, data: newItem };
    });
    const noneExistingData = uniqueProductVariantCodes.filter((id) => !existingIds.has(id)).map((id) => ({ id }));

    return [...productVariantsWithId, ...noneExistingData];
  }
}
