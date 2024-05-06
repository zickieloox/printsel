import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UsePipes } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import type { UpdateUserResDto } from 'shared';
import { GetUsersDto, GetUsersResDto, RoleType, UpdateUserDto } from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';

import { UserDocument } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
@UsePipes(ZodValidationPipe)
export class UserController {
  constructor(
    private userService: UserService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Get users',
  })
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: GetUsersResDto,
  })
  async getUsers(
    @Query()
    getUsersDto: GetUsersDto,
  ): Promise<GetUsersResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getUsers',
        method: 'GET',
        url: '/users',
        message: 'Get users',
        query: getUsersDto,
      }),
    });

    return await this.userService.getUsers(getUsersDto);
  }

  @Post('/update')
  @Auth()
  @ApiOperation({
    summary: 'Update user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UpdateUserDto,
  })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @AuthUser() user: UserDocument): Promise<UpdateUserResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateUser',
        method: 'POST',
        url: '/users',
        message: 'Update user',
        user,
        body: updateUserDto,
      }),
    });

    return await this.userService.updateUser(updateUserDto, user);
  }
}
