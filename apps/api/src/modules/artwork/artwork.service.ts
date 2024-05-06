import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderDirection, RoleType } from 'shared';

import type { UserEntity } from '@/modules/user/user.entity';
import { ApiConfigService } from '@/shared/services';

import type { ImageEntity } from '../upload/image.entity';
import { ImageRepository } from '../upload/image.repository';
import type { CreateArtworkDto } from './dtos/create-artwork.dto';
import type { UpdateArtworkDto } from './dtos/update-artwork.dto';

@Injectable()
export class ArtworkService {
  constructor(
    private imageRepository: ImageRepository,
    private readonly configService: ApiConfigService,
  ) {}

  async getArtworks(pageOptionsDto: PageOptionsDto, user: UserEntity): Promise<PageDto> {
    const { search, limit, skip } = pageOptionsDto;
    let query = {
      type: null,
    };

    if (user.role?.name === RoleType.Admin) {
      query = {
        fileName: {
          $regex: search || '',
          $options: 'i',
        },
      };
    }

    const { data: artworks, total } = await this.imageRepository.findAllAndCount(query, {
      paging: {
        skip,
        limit,
      },
      lean: false,
      withDeleted: true,
      sort: {
        updatedAt: OrderDirection.DESC,
      },
    });

    for (const artwork of artworks) {
      const file = artwork.file;
      file.preview = file.parseUrls() || '';
    }

    return new PageDto(artworks, total);
  }

  async getArtworkById(id: string): Promise<ImageEntity> {
    const artwork = await this.imageRepository.findOneById(id);

    if (!artwork) {
      throw new BadRequestException('Artwork not found');
    }

    const file = artwork.file;
    file.preview = file.parseUrls() || '';

    return artwork;
  }

  async createArtwork(createArtworkDto: CreateArtworkDto): Promise<ImageEntity> {
    return await this.imageRepository.create({
      ...createArtworkDto,
    });
  }

  async updateArtwork(id: string, updateArtworkDto: UpdateArtworkDto): Promise<ImageEntity> {
    const artwork = await this.imageRepository.findOneByIdAndUpdate(id, { ...updateArtworkDto });

    if (!artwork) {
      throw new BadRequestException('Artwork not found');
    }

    return artwork;
  }

  async deleteArtwork(id: string): Promise<boolean> {
    return await this.imageRepository.softDelete({ _id: id });
  }
}
