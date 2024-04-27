import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, PageOptionsDto, PageResponseDto, ResponseDto } from 'core';
import { FastifyReply } from 'fastify';
import { Readable } from 'stream';
import { Logger } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';
import { UserEntity } from '@/modules/user/user.entity';

import { CreateProductDto } from './dtos/create-product.dto';
import { ExportProductsDto } from './dtos/export-products.dto';
import { SyncProductToFactoryDto } from './dtos/sync-product-to-factory.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
@ApiTags('products')
export class ProductController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly productService: ProductService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get products',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getProducts(
    @Query()
    data: PageOptionsDto,
  ): Promise<PageResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProducts',
        method: 'GET',
        url: '/products',
        message: 'Get products',
        query: data,
      }),
    });

    return new PageResponseDto(await this.productService.getProducts(data));
  }

  @Get('/sync')
  @ApiOperation({
    summary: 'Syncing products + product variants + categories to fulfill',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async syncFactory(@Query() syncProductToFactoryDto: SyncProductToFactoryDto) {
    return new ResponseDto(await this.productService.syncToFactory(syncProductToFactoryDto));
  }

  @Post('/')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Create new product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async createProduct(@Body() createProductDto: CreateProductDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createProduct',
        method: 'POST',
        url: '/products',
        message: 'Create new product',
        user,
        body: createProductDto,
      }),
    });

    return new ResponseDto(await this.productService.createProduct(createProductDto, user));
  }

  @Put(':productId')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Update product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async updateProduct(
    @Body() data: UpdateProductDto,
    @AuthUser() user: UserEntity,
    @Param('productId') productId: string,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateProduct',
        method: 'PUT',
        url: `/products/${productId}`,
        message: 'Update product',
        user,
        body: data,
        params: {
          productId,
        },
      }),
    });

    return new ResponseDto(await this.productService.updateProduct(productId, data, user));
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export all product variants',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: 'application/octet-stream',
  })
  async export(@Query() exportProductsDto: ExportProductsDto, @Res() response: FastifyReply): Promise<void> {
    this.logger.info({
      message: JSON.stringify({
        action: 'export',
        method: 'GET',
        url: '/products/export',
        message: 'Export all product variants',
        query: exportProductsDto,
      }),
    });

    const fileData = await this.productService.export(exportProductsDto.type);

    // void response.header(
    //   'Content-Type',
    //   exportProductsDto.type === ExportType.XLSX
    //     ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    //     : 'text/csv',
    // );

    void response.header(
      'Content-Disposition',
      `attachment; filename=products.${exportProductsDto.type.toLowerCase()}`,
    );

    const stream = Readable.from(fileData);
    void response.send(stream);
  }

  @Get(':productId')
  @ApiOperation({
    summary: 'Get product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getProduct(@Param('productId') productId: string): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProduct',
        method: 'GET',
        url: `/products/${productId}`,
        message: 'Get product',
        param: {
          productId,
        },
      }),
    });

    return new ResponseDto(await this.productService.getProductDetail(productId));
  }

  @Delete(':productId')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Delete product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async deleteProduct(@Param('productId') productId: string): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'deleteProduct',
        method: 'DELETE',
        url: `/products/${productId}`,
        message: 'Delete product',
        param: {
          productId,
        },
      }),
    });

    return new ResponseDto(await this.productService.deleteProduct(productId));
  }
}
