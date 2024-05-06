import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { GetProductVariantsByCodesResDto } from 'shared';
import { GetProductVariantsByCodesDto, GetProductVariantsResDto, ProductVariantResDto } from 'shared';
import { Logger } from 'winston';

import { ProductVariantService } from './product-variant.service';

@Controller('product-variants')
@ApiTags('product-variants')
export class ProductVariantController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly productVariantService: ProductVariantService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get product variants',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetProductVariantsResDto,
  })
  async getProductVariants(): Promise<GetProductVariantsResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProductVariants',
        method: 'GET',
        url: '/product-variants/all',
        message: 'Get product variants',
      }),
    });

    return { success: true, ...(await this.productVariantService.getProductVariants()) };
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Validate product variants by code',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetProductVariantsResDto,
  })
  async getProductVariantsByCodes(
    @Body() getProductVariantsByCodesDto: GetProductVariantsByCodesDto,
  ): Promise<GetProductVariantsByCodesResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProductVariantsByCodes',
        method: 'POST',
        url: '/product-variants/bulk',
        message: 'Validate product variants by code',
        body: getProductVariantsByCodesDto,
      }),
    });

    return {
      success: true,
      ...(await this.productVariantService.getProductVariantsByCodes(getProductVariantsByCodesDto)),
    };
  }

  @Get(':variantId')
  @ApiOperation({
    summary: 'Get product variant',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ProductVariantResDto,
  })
  async getProductVariant(@Param('variantId') variantId: string): Promise<ProductVariantResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProductVariant',
        method: 'GET',
        url: `/product-variants/${variantId}`,
        message: 'Get product variant',
        params: {
          variantId,
        },
      }),
    });

    return { success: true, data: await this.productVariantService.getProductVariant(variantId) };
  }
}
