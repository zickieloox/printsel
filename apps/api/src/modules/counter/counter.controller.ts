import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'core';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';

import type { CounterEntity } from './counter.entity';
import { CounterService } from './counter.service';

@Controller('counters')
@ApiTags('counters')
export class CounterController {
  constructor(private counterService: CounterService) {}

  @Post(':key')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Update counter',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    type: ResponseDto,
  })
  findOneAndUpdateCounter(@Param('key') key: string): Promise<CounterEntity | null> {
    return this.counterService.findAndUpdateCounter(key);
  }
}
