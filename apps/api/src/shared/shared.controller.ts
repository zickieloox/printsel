import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AwsS3Service, ResponseDto } from 'core';

import { Auth } from '@/decorators';

@Controller('upload')
@ApiTags('upload')
export class SharedController {
  constructor(private readonly awsS3Services: AwsS3Service) {}

  @Get('generate-put-url')
  @Auth([], { public: true })
  @ApiOperation({
    summary: 'Generate S3 Put URL',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async generatePutObjectUrl(
    @Query('key')
    key: string,
    @Query('ContentType')
    ContentType: string,
  ): Promise<ResponseDto> {
    const putUrl = await this.awsS3Services.generatePutObjectUrl(key, ContentType);

    const fileUrl = putUrl.split('?')[0];

    return new ResponseDto({ putUrl, fileUrl });
  }
}
