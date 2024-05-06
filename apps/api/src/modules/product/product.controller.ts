import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import {
  CreateProductDto,
  CreateProductResDto,
  DeleteProductResDto,
  GetProductResDto,
  GetProductsDto,
  GetProductsResDto,
  RoleType,
} from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';
import { UserDocument } from '@/modules/user/user.entity';

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
    type: GetProductsResDto,
  })
  async getProducts(
    @Query()
    getProductsDto: GetProductsDto,
  ): Promise<GetProductsResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProducts',
        method: 'GET',
        url: '/products',
        message: 'Get products',
        query: getProductsDto,
      }),
    });

    return { success: true, ...(await this.productService.getProducts(getProductsDto)) };
  }

  @Post('/')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Create product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CreateProductResDto,
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @AuthUser() user: UserDocument,
  ): Promise<CreateProductResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createProduct',
        method: 'POST',
        url: '/products',
        message: 'Create product',
        user,
        body: createProductDto,
      }),
    });

    return { success: true, data: await this.productService.createProduct(createProductDto, user) };
  }

  // @Put(':productId')
  // @Auth([RoleType.Admin, RoleType.Manager])
  // @ApiOperation({
  //   summary: 'Update product',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   type: UpdateProductResDto,
  // })
  // async updateProduct(
  //   @Body() data: UpdateProductDto,
  //   @AuthUser() user: UserDocument,
  //   @Param('productId') productId: string,
  // ): Promise<UpdateProductResDto> {
  //   this.logger.info({
  //     message: JSON.stringify({
  //       action: 'updateProduct',
  //       method: 'PUT',
  //       url: `/products/${productId}`,
  //       message: 'Update product',
  //       user,
  //       body: data,
  //       params: {
  //         productId,
  //       },
  //     }),
  //   });

  //   return { success: true, data: await this.productService.updateProduct(productId, data, user) };
  // }

  // @Get('export')
  // @ApiOperation({
  //   summary: 'Export all product variants',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   type: 'application/octet-stream',
  // })
  // async export(@Query() exportProductsDto: ExportProductsDto, @Res() response: FastifyReply): Promise<void> {
  //   this.logger.info({
  //     message: JSON.stringify({
  //       action: 'export',
  //       method: 'GET',
  //       url: '/products/export',
  //       message: 'Export all product variants',
  //       query: exportProductsDto,
  //     }),
  //   });

  //   const fileData = await this.productService.export(exportProductsDto.type);

  //   // void response.header(
  //   //   'Content-Type',
  //   //   exportProductsDto.type === ExportType.XLSX
  //   //     ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   //     : 'text/csv',
  //   // );

  //   void response.header(
  //     'Content-Disposition',
  //     `attachment; filename=products.${exportProductsDto.type.toLowerCase()}`,
  //   );

  //   const stream = Readable.from(fileData);
  //   void response.send(stream);
  // }

  @Get('detail/:productId')
  @ApiOperation({
    summary: 'Get product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetProductResDto,
  })
  async getProductDetail(@Param('productId') productId: string): Promise<GetProductResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getProduct',
        method: 'GET',
        url: `/products/${productId}`,
        message: 'Get product',
        params: {
          productId,
        },
      }),
    });

    return { success: true, data: await this.productService.getProductDetail(productId) };
  }

  @Delete(':productId')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Delete product',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DeleteProductResDto,
  })
  async deleteProduct(@Param('productId') productId: string): Promise<DeleteProductResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'deleteProduct',
        method: 'DELETE',
        url: `/products/${productId}`,
        message: 'Delete product',
        params: {
          productId,
        },
      }),
    });

    await this.productService.deleteProduct(productId);

    return { success: true, data: null };
  }
}
