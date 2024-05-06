import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateCategoryDto, GetCategoriesDto, GetCategoriesResDto, UpdateCategoryDto } from 'shared';
import { OrderDirection } from 'shared';

import type { CategoryDocument } from './category.entity';
import { CategoryRepository } from './category.repository';
@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getCategories(getCategoriesDto: GetCategoriesDto): Promise<GetCategoriesResDto> {
    const { page, limit } = getCategoriesDto;

    return await this.categoryRepository.findAllAndCount(
      {},
      {
        paging: {
          skip: (page - 1) * limit,
          limit,
        },
        populate: {
          path: 'parent',
          select: ['name'],
        },
        sort: {
          createdAt: OrderDirection.DESC,
        },
      },
    );
  }

  async getAllCategories(): Promise<GetCategoriesResDto> {
    return await this.categoryRepository.findAllAndCount(
      {},
      {
        populate: {
          path: 'parent',
          select: ['name'],
        },
        sort: {
          createdAt: OrderDirection.DESC,
        },
      },
    );
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const existingCategory = await this.categoryRepository.findOne({
      $or: [{ name: createCategoryDto.name }, { code: createCategoryDto.code }],
    });

    if (existingCategory) {
      throw new BadRequestException("Can't duplicate code or name");
    }

    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOneById(createCategoryDto.parentId);

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return await this.categoryRepository.create(createCategoryDto);
  }

  async updateCategory(categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    const currentCategory = await this.categoryRepository.findOneById(categoryId);

    if (!currentCategory) {
      throw new NotFoundException('Category not found');
    }

    const existingCategory = await this.categoryRepository.findOne({
      $or: [{ name: updateCategoryDto.name }, { code: updateCategoryDto.code }],
    });

    if (existingCategory) {
      throw new BadRequestException("Can't duplicate code or name");
    }

    if (updateCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOneById(updateCategoryDto.parentId);

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = await this.categoryRepository.findOneByIdAndUpdate(categoryId, {
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const category = await this.categoryRepository.softDelete({ _id: categoryId });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return true;
  }
}
