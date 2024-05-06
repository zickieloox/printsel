import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, ResponseDto } from 'core';
import { CronTime } from 'cron';
import { RoleType, Status } from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';

import { UserDocument } from '../user/user.entity';
import { CronjobService } from './cronjob.service';
import { CreateCronjobDto } from './dtos';

@Controller('cronjobs')
@ApiTags('cronjobs')
export class CronjobController {
  constructor(
    private cronjobService: CronjobService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Post()
  @Auth([RoleType.Admin, RoleType.Developer])
  @ApiOperation({
    summary: 'Create cronjob',
  })
  @HttpCode(HttpStatus.OK)
  async createCronjob(@Body() createCronDto: CreateCronjobDto, @AuthUser() user: UserDocument): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createCronjob',
        method: 'POST',
        url: '/cronjobs',
        message: 'Create cronjob',
        user,
        body: createCronDto,
      }),
    });

    const cronjob = await this.cronjobService.createCronjob(createCronDto);
    this.schedulerRegistry.getCronJob(cronjob.code).setTime(new CronTime(cronjob.duration));

    if (cronjob.status === Status.Active) {
      this.schedulerRegistry.getCronJob(cronjob.code).start();
    } else {
      this.schedulerRegistry.getCronJob(cronjob.code).stop();
    }

    return new ResponseDto(cronjob);
  }

  @Get(':id')
  @Auth([RoleType.Admin, RoleType.Developer])
  @ApiOperation({
    summary: 'Get cronjob',
  })
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') _id: string, @AuthUser() user: UserDocument) {
    this.logger.info({
      message: JSON.stringify({
        action: 'getCronjob',
        method: 'GET',
        url: '/cronjobs/:id',
        message: 'Get cronjob',
        user,
        params: {
          id: _id,
        },
      }),
    });

    const cronjob = await this.cronjobService.getById(_id);

    if (!cronjob) {
      throw new NotFoundException('Cronjob not found');
    }

    return new ResponseDto(cronjob);
  }

  @Patch(':id')
  @Auth([RoleType.Admin, RoleType.Developer])
  @ApiOperation({
    summary: 'Update cronjob',
  })
  @HttpCode(HttpStatus.OK)
  async updateCronjob(
    @Param('id') id: string,
    @Body() createCronjobDto: CreateCronjobDto,
    @AuthUser() user: UserDocument,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'updateCronjob',
        method: 'PATCH',
        url: '/cronjobs/:id',
        message: 'Update cronjob',
        user,
        params: {
          id,
        },
        body: createCronjobDto,
      }),
    });

    const cronjob = await this.cronjobService.updateCronjob(id, createCronjobDto);

    if (!cronjob) {
      throw new NotFoundException('Cronjob not found');
    }

    this.schedulerRegistry.getCronJob(cronjob.code).setTime(new CronTime(cronjob.duration));

    if (cronjob.status === Status.Active) {
      this.schedulerRegistry.getCronJob(cronjob.code).start();
    } else {
      this.schedulerRegistry.getCronJob(cronjob.code).stop();
    }

    return new ResponseDto(cronjob);
  }

  @Delete(':id')
  @Auth([RoleType.Admin, RoleType.Developer])
  @ApiOperation({
    summary: 'Delete cronjob',
  })
  @HttpCode(HttpStatus.OK)
  async deleteCronjob(@Param('id') id: string, @AuthUser() user: UserDocument): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'deleteCronjob',
        method: 'DELETE',
        url: '/cronjobs/:id',
        message: 'Delete cronjob',
        user,
        params: {
          id,
        },
      }),
    });

    const cronjob = await this.cronjobService.getById(id);

    if (!cronjob) {
      throw new NotFoundException('Cronjob not found');
    }

    await this.cronjobService.deleteCronjob(id);

    this.schedulerRegistry.getCronJob(cronjob.code).stop();

    return new ResponseDto(cronjob);
  }
}
