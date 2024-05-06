import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import { RoleType } from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';
import { UserEntity } from '@/modules/user/user.entity';

import { ArtworkService } from './artwork.service';
import { UpdateArtworkDto } from './dtos/update-artwork.dto';

@Controller('artworks')
@ApiTags('artworks')
export class ArtworkController {
  constructor(
    private readonly artworkService: ArtworkService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Get artworks',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getArtworks(
    @Query()
    pageOptionsDto: PageOptionsDto,
    @AuthUser()
    user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getArtworks',
        method: 'GET',
        url: '/artworks',
        message: 'Get artworks',
        user,
        query: pageOptionsDto,
      }),
    });

    return new PageResponseDto(await this.artworkService.getArtworks(pageOptionsDto, user));
  }

  @Get(':artworkId')
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Get detail artwork',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async getArtworkById(@Param('artworkId') artworkId: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'getArtworkById',
        method: 'GET',
        url: `/artworks/${artworkId}`,
        message: 'Get detail artwork',
        user,
        params: {
          artworkId,
        },
      }),
    });

    return new ResponseDto(await this.artworkService.getArtworkById(artworkId));
  }

  @Post(':artworkId/download')
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Download artwork',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async downloadArtwork(@Param('artworkId') artworkId: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'POST',
        url: `/artworks/${artworkId}/download`,
        message: 'Download artwork',
        action: 'downloadArtwork',
        user,
        params: {
          artworkId,
        },
      }),
    });

    return new ResponseDto(await this.artworkService.downloadArtwork(artworkId));
  }

  @Put(':artworkId')
  @Auth([RoleType.Admin, RoleType.Seller, RoleType.Manager])
  @ApiOperation({
    summary: 'Update artwork',
  })
  async updateArtwork(
    @Param('artworkId') artworkId: string,
    @Body() updateArtworkDto: UpdateArtworkDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'PUT',
        url: `/artworks/${artworkId}`,
        message: 'Update artwork',
        action: 'updateArtwork',
        user,
        param: {
          artworkId,
        },
        body: updateArtworkDto,
      }),
    });

    return new ResponseDto(await this.artworkService.updateArtwork(artworkId, updateArtworkDto));
  }

  @Delete(':artworkId')
  @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Delete Artwork',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseDto,
  })
  async deleteArtwork(@Param('artworkId') artworkId: string, @AuthUser() user: UserEntity): Promise<ResponseDto> {
    this.logger.info({
      message: JSON.stringify({
        method: 'PUT',
        url: `/artworks/${artworkId}`,
        message: 'Delete Artwork',
        action: 'deleteArtwork',
        user,
        param: {
          artworkId,
        },
      }),
    });

    return new ResponseDto(await this.artworkService.deleteArtwork(artworkId));
  }
}
