// upload.controller.ts
import { Body, Controller, Delete, Post, UploadedFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IApiFile, AuthUser, ResponseDto } from 'core';
import { IFile } from 'shared';

import { RoleType } from '@/constants';
import { Auth } from '@/decorators';
import { UserEntity } from '@/modules/user/user.entity';

import { FileUploadDto } from './dto/file-upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
@ApiTags('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Auth() //[RoleType.Admin, RoleType.Seller]
  @ApiOperation({
    summary: 'Upload File',
  })
  @ApiOkResponse({
    type: ResponseDto,
  })
  @IApiFile({ name: 'file' })
  async uploadFile(
    @Body() fileUploadData: FileUploadDto,
    @AuthUser() user: UserDocument,
    @UploadedFile()
    file?: IFile,
  ): Promise<ResponseDto> {
    const { type, shouldUploadThumbnail } = fileUploadData;

    return new ResponseDto(await this.uploadService.uploadToS3(file, type, shouldUploadThumbnail, user));
  }

  @Delete()
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Delete unused files',
  })
  @ApiOkResponse({
    type: ResponseDto,
  })
  async deleteUnusedFile(): Promise<ResponseDto> {
    return new ResponseDto(await this.uploadService.deleteUnusedFiles());
  }
}
