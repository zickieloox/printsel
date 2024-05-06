import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import {
  CreateCategoryDto,
  CreateCategoryResDto,
  DeleteCategoryResDto,
  GetCategoriesDto,
  GetCategoriesResDto,
  RoleType,
  UpdateCategoryDto,
  UpdateCategoryResDto,
} from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';

import { UserEntity } from '../user/user.entity';
import { CategoryService } from './category.service';

@Controller('categories')
@ApiTags('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get categories',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetCategoriesResDto,
  })
  async getCategories(@Query() getCategoriesDto: GetCategoriesDto): Promise<GetCategoriesResDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'GET',
        url: '/categories',
        message: 'Get categories',
        action: 'getCategories',
        query: getCategoriesDto,
      }),
    });

    return { success: true, ...(await this.categoryService.getCategories(getCategoriesDto)) };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all categories',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetCategoriesResDto,
  })
  async getAllCategories(): Promise<GetCategoriesResDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'GET',
        url: '/categories/all',
        message: 'Get all categories',
        action: 'getAllCategories',
      }),
    });

    return { success: true, ...(await this.categoryService.getAllCategories()) };
  }

  @Post()
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Create category',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CreateCategoryResDto,
  })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @AuthUser() user: UserEntity,
  ): Promise<CreateCategoryResDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'POST',
        url: '/categories',
        message: 'Create category',
        action: 'createCategory',
        body: createCategoryDto,
        user,
      }),
    });

    const category = await this.categoryService.createCategory(createCategoryDto);

    return {
      success: true,
      data: category,
    };
  }

  @Patch(':id')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Update category',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UpdateCategoryResDto,
  })
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id') categoryId: string,
    @AuthUser() user: UserEntity,
  ): Promise<UpdateCategoryResDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'PATCH',
        url: '/categories',
        message: 'Update category',
        action: 'updateCategory',
        body: updateCategoryDto,
        params: {
          categoryId,
        },
        userId: user._id,
      }),
    });

    const category = await this.categoryService.updateCategory(categoryId, updateCategoryDto);

    return {
      success: true,
      data: category,
    };
  }

  @Delete(':id')
  @Auth([RoleType.Admin, RoleType.Manager])
  @ApiOperation({
    summary: 'Delete category',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DeleteCategoryResDto,
  })
  async deleteCategory(@Param('id') categoryId: string, @AuthUser() user: UserEntity): Promise<DeleteCategoryResDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'DELETE',
        url: `/categories/:${categoryId}`,
        message: 'Delete category',
        action: 'deleteCategory',
        params: {
          categoryId,
        },
        user,
      }),
    });

    await this.categoryService.deleteCategory(categoryId);

    return {
      success: true,
      data: null,
    };
  }
}
