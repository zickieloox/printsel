import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'core';
import { Logger } from 'winston';

import { ProductVariantCodesDto } from './dtos/product-variant-codes.dto';
import { ProductVariantService } from './product-variant.service';

@Controller('product-variants')
@ApiTags('product-variants')
export class ProductVariantController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly productVariantService: ProductVariantService,
  ) {}

  @Get('/all')
  @ApiOperation({
    summary: 'Get all product variants',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getAllProductVariants(): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getAllProductVariants',
        method: 'GET',
        url: '/product-variants/all',
        message: 'Get all product variants',
      }),
    });

    return new ResponseDto(await this.productVariantService.getAllProductVariants());
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Validate product variants by code',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getProductVariantsByCodes(@Body() productVariantIdsDto: ProductVariantCodesDto): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProductVariantsByCodes',
        method: 'POST',
        url: '/product-variants/bulk',
        message: 'Validate product variants by code',
        body: productVariantIdsDto,
      }),
    });

    const nonExistingIds = await this.productVariantService.getProductVariantsByCodes(productVariantIdsDto);

    return new ResponseDto(nonExistingIds);
  }

  @Get(':productVariantId')
  @ApiOperation({
    summary: 'Get product variant',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getProductVariant(@Param('productVariantId') productVariantId: string): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProductVariant',
        method: 'GET',
        url: `/product-variants/${productVariantId}`,
        message: 'Get product variant',
        param: {
          productVariantId,
        },
      }),
    });

    return new ResponseDto(await this.productVariantService.getProductVariant(productVariantId));
  }
}
