import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import {
  CreateRoleDto,
  CreateRoleResDto,
  GetRolesDto,
  GetRolesResDto,
  RoleType,
  UpdateRoleDto,
  UpdateRoleResDto,
} from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';

import { UserDocument } from '../user/user.entity';
import { RoleService } from './role.service';

@Controller('roles')
@ApiTags('roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Get roles',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetRolesResDto,
  })
  async getRoles(@Query() getRolesDto: GetRolesDto, @AuthUser() user: UserDocument): Promise<GetRolesResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getRoles',
        method: 'GET',
        url: '/roles',
        message: 'Get roles',
        userId: user._id,
      }),
    });

    return {
      success: true,
      ...(await this.roleService.getRoles(getRolesDto)),
    };
  }

  @Post()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Create role',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CreateRoleResDto,
  })
  async createRole(@Body() createRoleDto: CreateRoleDto, @AuthUser() user: UserDocument): Promise<CreateRoleResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createRole',
        method: 'POST',
        url: '/roles',
        message: 'Create role',
        body: createRoleDto,
        userId: user._id,
      }),
    });

    return { success: true, data: await this.roleService.createRole(createRoleDto) };
  }

  @Patch(':roleId')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Update role',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UpdateRoleResDto,
  })
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @AuthUser() user: UserDocument,
  ): Promise<UpdateRoleResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateRole',
        method: 'PATCH',
        url: `/roles/${roleId}`,
        message: 'Update role',
        body: updateRoleDto,
        params: {
          roleId,
        },
        userId: user._id,
      }),
    });

    return { success: true, data: await this.roleService.updateRole(roleId, updateRoleDto) };
  }
}
