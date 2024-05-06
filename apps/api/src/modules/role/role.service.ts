import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateRoleDto, GetRolesDto, GetRolesResDto, UpdateRoleDto } from 'shared';

import type { RoleDocument } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  public async createRole(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    return this.roleRepository.create({
      ...createRoleDto,
    });
  }

  async getRoles(getRolesDto: GetRolesDto): Promise<GetRolesResDto> {
    const { page, limit, status } = getRolesDto;

    console.log(getRolesDto);

    let query = {};

    if (status) {
      query = {
        ...query,
        status,
      };
    }

    return await this.roleRepository.findAllAndCount(
      { ...query },
      {
        paging: {
          limit,
          skip: limit * (page - 1),
        },
        select: ['name', 'description', 'status', 'permissionIds'],
      },
    );
  }

  async findOneById(roleId: string): Promise<RoleDocument> {
    const role = await this.roleRepository.findOneById(roleId, { populate: { path: 'permissions' } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  public async updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<RoleDocument> {
    const role = await this.roleRepository.findOneByIdAndUpdate(roleId, updateRoleDto);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
