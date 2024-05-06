import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, PageOptionsDto, PageResponseDto, ResponseDto } from 'core';
import { Logger } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';
import { UserEntity } from '@/modules/user/user.entity';

import { MockupService } from './mockup.service';

@Controller('mockups')
@ApiTags('mockups')
export class MockupController {
  constructor(
    private readonly mockupService: MockupService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN, RoleType.SELLER, RoleType.MANAGER, RoleType.DESIGNER])
  @ApiOperation({
    summary: 'Get mockups',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getMockups(
    @Query()
    pageOptionsDto: PageOptionsDto,
    @AuthUser()
    user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getMockups',
        method: 'GET',
        url: '/mockups',
        message: 'Get mockups',
        user,
        query: pageOptionsDto,
      }),
    });

    return new PageResponseDto(await this.mockupService.getMockups(pageOptionsDto, user));
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.SELLER, RoleType.MANAGER, RoleType.DESIGNER])
  @ApiOperation({
    summary: 'Get mockup',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getMockupById(@Param('id') id: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getMockupById',
        method: 'GET',
        url: '/mockups/:id',
        message: 'Get mockup',
        user,
        param: {
          id,
        },
      }),
    });

    return new ResponseDto(await this.mockupService.getMockupById(id));
  }

  @Post(':id/download')
  @Auth([RoleType.ADMIN, RoleType.SELLER, RoleType.MANAGER, RoleType.DESIGNER])
  @ApiOperation({
    summary: 'Download mockup',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async downloadMockup(@Param('id') id: string, @AuthUser() user: UserEntity): Promise<unknown> {
    this.logger.info({
      message: JSON.stringify({
        action: 'downloadMockup',
        method: 'POST',
        url: '/mockups/:id/download',
        message: 'Download mockup',
        user,
        param: {
          id,
        },
      }),
    });

    return await this.mockupService.downloadMockup(id);
  }
}
