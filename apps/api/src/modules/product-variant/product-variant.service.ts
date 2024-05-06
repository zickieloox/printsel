import { BadRequestException, Injectable } from '@nestjs/common';
import type { GetProductVariantsByCodesDto, GetProductVariantsByCodesResDto, GetProductVariantsResDto } from 'shared';
import { OrderDirection } from 'shared';

import type { ProductVariantDocument } from './product-variant.entity';
import { ProductVariantRepository } from './product-variant.repository';

@Injectable()
export class ProductVariantService {
  constructor(private productVariantRepository: ProductVariantRepository) {}

  async getProductVariants(): Promise<GetProductVariantsResDto> {
    return await this.productVariantRepository.findAllAndCount(
      {},
      {
        sort: { createdAt: OrderDirection.DESC },
        select: ['title', 'productId', 'code', 'sku', 'option1', 'option2', 'option3', 'option4', 'price'],
      },
    );
  }

  async getProductVariant(variantId: string): Promise<ProductVariantDocument> {
    const productVariant = await this.productVariantRepository.findOneById(variantId);

    if (!productVariant) {
      throw new BadRequestException('Product variant not found');
    }

    return productVariant;
  }

  async getProductVariantsByCodes(
    getProductVariantsByCodesDto: GetProductVariantsByCodesDto,
  ): Promise<GetProductVariantsByCodesResDto> {
    const { codes } = getProductVariantsByCodesDto;
    const uniqueCodes = [...new Set(codes as string[])];

    const existingProductVariants = await this.productVariantRepository.findAll(
      { code: { $in: uniqueCodes } },
      { select: ['title', 'productId', 'code', 'sku', 'option1', 'option2', 'option3', 'option4', 'price'] },
    );

    const existingCodes = new Set(existingProductVariants.map((variant) => variant.code));
    const nonExistingCodes = uniqueCodes.filter((id) => !existingCodes.has(id));

    return {
      data: { existing: existingProductVariants, nonExisting: nonExistingCodes },
    };
  }
}
