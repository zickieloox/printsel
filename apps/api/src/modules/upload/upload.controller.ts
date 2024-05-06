import { Body, Controller, Post, UploadedFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiFile, AuthUser, IFile } from 'core';
import { UploadImageDto, UploadImageResDto } from 'shared';

import { Auth } from '@/decorators';

import { UserDocument } from '../user/user.entity';
import { UploadService } from './upload.service';

@Controller('upload')
@ApiTags('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Auth() //[RoleType.Admin, RoleType.Seller]
  @ApiOperation({
    summary: 'Upload image',
  })
  @ApiOkResponse({
    type: UploadImageResDto,
  })
  @ApiFile({ name: 'file' })
  async uploadImage(
    @Body() uploadImageDto: UploadImageDto,
    @AuthUser() user: UserDocument,
    @UploadedFile()
    file: IFile,
  ): Promise<UploadImageResDto> {
    const { type } = uploadImageDto;

    const data = await this.uploadService.uploadImage(type, file, user);

    return {
      success: true,
      data,
    };
  }

  // @Delete()
  // @Auth([RoleType.Admin])
  // @ApiOperation({
  //   summary: 'Delete unused files',
  // })
  // @ApiOkResponse({
  //   type: ResDto,
  // })
  // async deleteUnusedFile(): Promise<ResDto> {
  //   const data = await this.uploadService.deleteUnusedFiles();

  //   return {
  //     success: true,
  //     data,
  //   };
  // }
}
