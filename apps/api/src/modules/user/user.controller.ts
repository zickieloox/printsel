import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UsePipes } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import { Logger, query } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';

import { UserService } from './user.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { GetUsersDto, GetUsersResDto, UpdateUserDto, UpdateUserResDto } from './user.dto';
import { UserDocument, UserEntity } from './user.entity';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  // @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Get users',
  })
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: GetUsersResDto,
  })
  @UsePipes(ZodValidationPipe)
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
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
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

    /// @ts-ignore
    return await this.userService.updateUser(updateUserDto, user);
  }
}
