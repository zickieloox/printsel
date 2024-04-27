import { BadRequestException, Injectable } from '@nestjs/common';
import { CronTime } from 'cron';
import { Types } from 'mongoose';

import type { CronjobEntity } from './cronjob.entity';
import { CronjobRepository } from './cronjob.repository';
import type { CreateCronjobDto } from './dtos';

@Injectable()
export class CronjobService {
  constructor(private cronjobRepository: CronjobRepository) {}

  getById(cronjobId: string): Promise<CronjobEntity | null> {
    return this.cronjobRepository.findOneById(cronjobId);
  }

  async createCronjob(createCronjob: CreateCronjobDto): Promise<CronjobEntity> {
    try {
      new CronTime(createCronjob.duration);
    } catch {
      throw new BadRequestException('Invalid cron duration');
    }

    return await this.cronjobRepository.create(createCronjob);
  }

  async updateCronjob(id: string, createCronjobDto: CreateCronjobDto): Promise<CronjobEntity | null> {
    try {
      new CronTime(createCronjobDto.duration);
    } catch {
      throw new BadRequestException('Invalid cron duration');
    }

    return await this.cronjobRepository.findOneAndUpdate({ _id: new Types.ObjectId(id) }, createCronjobDto);
  }

  async deleteCronjob(id: string): Promise<boolean> {
    return await this.cronjobRepository.softDeleteById(id);
  }

  findAllActiveCronjobs(): Promise<CronjobEntity[]> {
    return this.cronjobRepository.findAll({ status: 'active' });
  }
}
