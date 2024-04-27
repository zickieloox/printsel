import { Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';

import type { CreateRoleDto, UpdateRoleDto } from './dtos';
import type { RoleEntity } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  public async createRole(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    return this.roleRepository.create({
      ...createRoleDto,
    });
  }

  async getRoles(): Promise<RoleEntity[]> {
    return this.roleRepository.findAll({}, { select: ['name', 'description', 'status', 'permissions'] });
  }

  async findOneById(roleId: string | Types.ObjectId): Promise<RoleEntity | null> {
    return this.roleRepository.findOneById(roleId, { populate: { path: 'permissions' } });
  }

  public async updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity | null> {
    return this.roleRepository.findOneByIdAndUpdate(roleId, updateRoleDto);
  }
}
