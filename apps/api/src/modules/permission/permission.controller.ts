import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, ResponseDto } from 'core';
import { Logger } from 'winston';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';

import { UserEntity } from '../user/user.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos';
import { PermissionService } from './permission.service';

@Controller('permissions')
@ApiTags('permissions')
export class PermissionController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly permissionService: PermissionService,
  ) {}

  @Get()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Get permissions',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getPermissions(@AuthUser() user: UserDocument): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getPermissions',
        method: 'GET',
        url: '/permissions',
        message: 'Get permissions',
        user,
      }),
    });

    return new ResponseDto(await this.permissionService.getAllPermissions());
  }

  @Post()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Create new permission',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
    @AuthUser() user: UserDocument,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createPermission',
        method: 'POST',
        url: '/permissions',
        message: 'Create new permission',
        user,
        body: createPermissionDto,
      }),
    });

    return new ResponseDto(await this.permissionService.createPermission(createPermissionDto));
  }

  @Patch(':id')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Update permission',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async updatePermission(
    @Param('id') permissionId: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @AuthUser() user: UserDocument,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updatePermission',
        method: 'PATCH',
        url: `/permissions/${permissionId}`,
        message: 'Update permission',
        user,
        body: updatePermissionDto,
        params: {
          permissionId,
        },
      }),
    });

    const permission = await this.permissionService.updatePermission(permissionId, updatePermissionDto);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return new ResponseDto(permission);
  }
}
