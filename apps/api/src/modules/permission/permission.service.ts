/* eslint-disable unicorn/no-array-reduce */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { CreatePermissionDto, UpdatePermissionDto } from './dtos';
import { PermissionEntity } from './permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(PermissionEntity.name)
    private permissionModel: Model<PermissionEntity>,
    private permissionRepository: PermissionRepository,
  ) {}

  public async createPermission(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    return await this.permissionRepository.create({
      ...createPermissionDto,
    });
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.findAll({}, { select: ['name', 'description', 'status', 'action'] });
  }

  async findOneById(permissionId: string): Promise<PermissionEntity | null> {
    return this.permissionRepository.findOneById(permissionId);
  }

  public async updatePermission(
    permissionId: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity | null> {
    return this.permissionRepository.findOneByIdAndUpdate(permissionId, updatePermissionDto);
  }
}
