import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, PageResponseDto, ResponseDto } from 'core';
import { Logger } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';
import { UserEntity } from '@/modules/user/user.entity';

import { CreateOrderDto } from './dtos/create-order.dto';
import { GetOrdersDto, GetStatisticDto, ResponseOrderDto } from './dtos/get-order.dto';
import { ImportOrdersDto } from './dtos/import-orders.dto';
import { SyncOrderToFactoryDto } from './dtos/sync-order-to-factory.dto';
import { UpdateArtworkError } from './dtos/update-artwork-error.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { UpdateOrderFromFactoryDto } from './dtos/update-order-from-factory';
import { PayOrdersDto } from './interfaces/pay-orders-dto';
import { OrderService } from './order.service';

@Controller('orders')
@ApiTags('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Get orders',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  async getOrders(@Query() getOrdersDto: GetOrdersDto, @AuthUser() user: UserEntity): Promise<PageResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getOrders',
        method: 'GET',
        url: '/orders',
        message: 'Get orders',
        user,
        query: getOrdersDto,
      }),
    });

    if (getOrdersDto.productId) {
      return new PageResponseDto(await this.orderService.getOrdersByProductId(getOrdersDto, user));
    }

    return new PageResponseDto(await this.orderService.getOrders(getOrdersDto, user));
  }

  @Get('/statistic')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Get order statistics',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  async getStatistics(@Query() data: GetStatisticDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getStatistics',
        method: 'GET',
        url: '/orders/statistic',
        message: 'Get order statistics',
        user,
        query: data,
      }),
    });

    return new ResponseDto(await this.orderService.getStatistics(data));
  }

  @Get('/scan/:barcode')
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
    description: 'Get order detail by barcode',
  })
  async getOrderDetailByBarcode(@Param('barcode') barcode: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getOrderDetailByBarcode',
        method: 'GET',
        url: '/orders/scan/:barcode',
        message: 'Get order detail by barcode',
        user,
        param: {
          barcode,
        },
      }),
    });

    return new ResponseDto(await this.orderService.getOrderDetailByBarcode(barcode));
  }

  @Post()
  @Auth([RoleType.Seller])
  @ApiOperation({
    summary: 'Create order manually',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createOrder',
        method: 'POST',
        url: '/orders',
        message: 'Create order',
        user,
        body: createOrderDto,
      }),
    });

    return new ResponseDto(await this.orderService.createOrder(createOrderDto, user));
  }

  @Post('/:id/update-note')
  @Auth([RoleType.Seller, RoleType.Manager])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
    description: 'update note',
  })
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateNote',
        method: 'POST',
        url: '/orders/:id/update-note',
        message: 'Update note',
        user,
        param: {
          id,
        },
        body: updateNoteDto,
      }),
    });

    return new ResponseDto(await this.orderService.updateNote(id, updateNoteDto));
  }

  @Post('/:id/update-system-note')
  @Auth([RoleType.Admin, RoleType.Manager])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
    description: 'update note',
  })
  async updateSystemNote(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateSystemNote',
        method: 'POST',
        url: '/orders/:id/update-system-note',
        message: 'Update note',
        user,
        param: {
          id,
        },
        body: updateNoteDto,
      }),
    });

    return new ResponseDto(await this.orderService.updateSystemNote(id, updateNoteDto));
  }

  @Put(':id/status')
  @Auth([RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Update status',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  async updateStatus(
    @Body() status: string,
    @Param('id') id: string,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateStatus',
        method: 'PUT',
        url: '/orders/:id/status',
        message: 'Update status',
        user,
        param: {
          id,
        },
        body: status,
      }),
    });

    return new ResponseDto(await this.orderService.updateStatus(id, status, user));
  }

  formatDateBarcode(date: Date) {
    const strDate = new Date(date).toISOString().split(':')[0];

    return strDate.replaceAll(/\s/g, '_');
  }

  @Get(':id')
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Get order detail',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  async getOrder(@Param('id') id: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getOrder',
        method: 'GET',
        url: '/orders/:id',
        message: 'Get order detail',
        user,
        param: {
          id,
        },
      }),
    });

    return new ResponseDto(await this.orderService.getOrderDetail(id, user));
  }

  // @Post('/create-shipment/:id')
  // @Auth([RoleType.Seller])
  // @ApiOperation({
  //   summary: 'Create shipment order',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   type: ResponseDto,
  // })
  // async createShipment(@Param('id') id: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
  //   this.logger.info({
  //     message: JSON.stringify({
  //       action: 'createShipment',
  //       method: 'POST',
  //       url: '/orders/create-shipment/:id',
  //       message: 'Create shipment order',
  //       user,
  //       param: {
  //         id,
  //       },
  //     }),
  //   });

  //   return new ResponseDto(await this.orderService.createShipment(id));
  // }

  // @Post('/import')
  // @Auth([RoleType.Seller])
  // @ApiOperation({
  //   summary: 'Bulk orders import via CSV',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   type: ResponseDto,
  // })
  // async importOrders(@Body() importOrdersDto: ImportOrdersDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
  //   this.logger.info({
  //     message: JSON.stringify({
  //       action: 'importOrders',
  //       method: 'POST',
  //       url: '/orders/import',
  //       message: 'Bulk orders import via CSV',
  //       user,
  //       body: importOrdersDto,
  //     }),
  //   });

  //   return new ResponseDto(await this.orderService.importOrders(importOrdersDto, user));
  // }

  @Post('calc-pay-orders')
  @Auth([RoleType.Seller])
  @ApiOperation({
    summary: 'Calculate total for bulk paid orders',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async calculateBulkPayment(@Body() payOrdersDto: PayOrdersDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'calculateBulkPayment',
        method: 'POST',
        url: '/orders/calc-pay-orders',
        message: 'Calculate total for bulk paid orders',
        user,
        body: payOrdersDto,
      }),
    });

    return new ResponseDto(await this.orderService.calculateBulkPayment(payOrdersDto, user));
  }

  @Post('pay-orders')
  @Auth([RoleType.Seller])
  @ApiOperation({
    summary: 'Bulk paid orders',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async payOrders(@Body() payOrdersDto: PayOrdersDto, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'payOrders',
        method: 'POST',
        url: '/orders/pay-orders',
        message: 'Bulk paid orders',
        user,
        body: payOrdersDto,
      }),
    });

    return new ResponseDto(await this.orderService.payOrders(payOrdersDto, user));
  }

  @Put('/update-order-from-factory')
  @ApiOperation({
    summary: 'Update order from factory',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async updateOrderFromFactory(@Body() updateOrderFromFactoryDto: UpdateOrderFromFactoryDto): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateOrderFromFactory',
        method: 'PUT',
        url: '/orders/update-order-from-factory',
        message: 'Update order from factory',
        body: updateOrderFromFactoryDto,
      }),
    });

    return new ResponseDto(await this.orderService.updateOrderFromFactory(updateOrderFromFactoryDto));
  }
}
