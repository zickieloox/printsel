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
import { CreateRoleDto, UpdateRoleDto } from './dtos';
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
    type: ResponseDto,
  })
  async getRoles(@AuthUser() user: UserDocument): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getRoles',
        method: 'GET',
        url: '/roles',
        message: 'Get roles',
        user,
      }),
    });

    return new ResponseDto(await this.roleService.getRoles());
  }

  @Post()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Create new role',
  })
  @HttpCode(HttpStatus.OK)
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createRole',
        method: 'POST',
        url: '/roles',
        message: 'Create new role',
        body: createRoleDto,
      }),
    });

    return new ResponseDto(await this.roleService.createRole(createRoleDto));
  }

  @Patch(':id')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Update role',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @AuthUser() user: UserDocument,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateRole',
        method: 'PATCH',
        url: `/roles/${roleId}`,
        message: 'Update role',
        body: updateRoleDto,
        user,
        params: {
          roleId,
        },
      }),
    });
    const role = await this.roleService.updateRole(roleId, updateRoleDto);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return new ResponseDto(role);
  }
}
