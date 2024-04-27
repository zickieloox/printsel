import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, ResponseDto } from 'core';
import { Logger } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';

import { ResponseOrderDto } from '../order/dtos/get-order.dto';
import { UserEntity } from '../user/user.entity';
import { UpdateExternalFileLinkDto } from './dtos/update-external-file-link.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { OrderItemService } from './order-item.service';
@Controller('order-items')
@ApiTags('order-items')
export class OrderItemController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly orderItemService: OrderItemService,
  ) {}

  @Post('/:id/update-note')
  @Auth([RoleType.Admin, RoleType.Seller])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  @ApiOperation({
    summary: 'Update seller note',
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
        url: `/order-items/${id}/update-note`,
        message: 'Update seller note',
        user,
        body: updateNoteDto,
        params: {
          id,
        },
      }),
    });

    return new ResponseDto(await this.orderItemService.updateNote(id, updateNoteDto));
  }

  @Post('/:id/update-system-note')
  @Auth([RoleType.Admin, RoleType.Manager])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseOrderDto,
  })
  @ApiOperation({
    summary: 'Update system note',
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
        url: `/order-items/${id}/update-system-note`,
        message: 'Update system note',
        user,
        body: updateNoteDto,
        params: {
          id,
        },
      }),
    });

    return new ResponseDto(await this.orderItemService.updateSystemNote(id, updateNoteDto));
  }
}
