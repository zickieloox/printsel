import { BadRequestException, Injectable } from '@nestjs/common';
import { PageDto, type PageOptionsDto } from 'core';
import { encrypt, generateSignature, OrderDirection } from 'shared';

import { RoleType } from '@/constants';
import type { UserEntity } from '@/modules/user/user.entity';
import { ApiConfigService } from '@/shared/services';

import type { CreateMockupDto } from './dtos/create-mockup.dto';
import type { UpdateMockupDto } from './dtos/update-mockup.dto';
import type { MockupEntity } from './mockup.entity';
import { MockupRepository } from './mockup.repository';

@Injectable()
export class MockupService {
  constructor(
    private mockupRepository: MockupRepository,
    private readonly configService: ApiConfigService,
  ) {}

  async getMockups(pageOptionsDto: PageOptionsDto, user: UserEntity): Promise<PageDto> {
    const { search, limit, skip } = pageOptionsDto;

    let conditionKeyword: Record<string, string> | string = '';

    if (user.role.name === RoleType.ADMIN) {
      conditionKeyword = {
        $regex: search || '',
        $options: 'i',
      };
    }

    const [mockups, total] = await this.mockupRepository.findAllAndCount(
      {
        fileName: conditionKeyword,
        owner: user._id,
      },
      {
        paging: {
          skip,
          limit,
        },
        populate: {
          path: 'file',
          select: ['preview', 'previewFolder'],
        },
        lean: false,
        sort: {
          createdAt: OrderDirection.DESC,
        },
      },
    );

    for (const mockup of mockups) {
      const file = mockup.file;
      file.preview = file.parseUrls() || '';
    }

    return new PageDto(mockups, total);
  }

  async getMockupById(id: string): Promise<MockupEntity> {
    const mockup = await this.mockupRepository.findOneById(id);

    if (!mockup) {
      throw new BadRequestException('Mockup not found');
    }

    return mockup;
  }

  async createMockup(createMockupDto: CreateMockupDto): Promise<MockupEntity> {
    return await this.mockupRepository.create({
      ...createMockupDto,
    });
  }

  async updateMockup(id: string, updateMockupDto: UpdateMockupDto): Promise<MockupEntity> {
    const mockup = await this.mockupRepository.findOneByIdAndUpdate(id, updateMockupDto);

    if (!mockup) {
      throw new BadRequestException('Mockup not found');
    }

    return mockup;
  }

  async deleteMockup(id: string): Promise<boolean> {
    return await this.mockupRepository.softDeleteById(id);
  }

  async downloadMockup(
    id: string,
  ): Promise<{ signature: string; encryptedUrl: string; cdn: string; expiresAt: number }> {
    const mockup = await this.mockupRepository.findOneById(id, {
      populate: {
        path: 'file',
        select: ['key', 'bucket', 'folder'],
      },
    });

    if (!mockup) {
      throw new BadRequestException('Mockup not found');
    }

    const { key, bucket, folder } = mockup.file;
    const url = `${this.configService.downloadSecret.storage}/file/${bucket}/${folder}/${key}`;
    const aesSecret = this.configService.downloadSecret.aesSecret;
    const hmacSecret = this.configService.downloadSecret.hmac;
    const expirationTime = Date.now() + 15 * 60 * 1000; // 15m (now + minutes * 60seconds * 1000milliseconds)
    const encryptedUrl = await encrypt(url, aesSecret);
    const signature = await generateSignature(encryptedUrl, hmacSecret);

    return {
      signature,
      encryptedUrl,
      cdn: this.configService.downloadSecret.cdnUrl,
      expiresAt: expirationTime,
    };
  }
}
