import { BadRequestException, Injectable } from '@nestjs/common';
import type { UploadFileDto } from 'core';
import { AwsS3Service } from 'core';
import crypto from 'crypto';
import { Types } from 'mongoose';
import type { IFile } from 'shared';
import { FolderType } from 'shared';
import sharp from 'sharp';

import { FileType } from '@/constants';
// import { ArtworkRepository } from '@/modules/artwork/artwork.repository';
// import { MockupRepository } from '@/modules/mockup/mockup.repository';
import type { UserEntity } from '@/modules/user/user.entity';
import { ApiConfigService } from '@/shared/services';

// import type { ArtworkEntity } from '../artwork/artwork.entity';
// import type { MockupEntity } from '../mockup/mockup.entity';
import type { FileEntity } from './file.entity';
import { FileRepository } from './file.repository';

@Injectable()
export class UploadService {
  constructor(
    private fileRepository: FileRepository,
    // private artworkRepository: ArtworkRepository,
    // private mockupRepository: MockupRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly configService: ApiConfigService,
    private readonly backblazeService: BackblazeService,
  ) {}

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async uploadToS3(
    file?: IFile,
    type?: FileType,
    shouldUploadThumbnail?: boolean,
    user?: UserEntity,
  ): Promise<{ _id: string; preview: string }> {
    if (!file) {
      throw new BadRequestException('Upload file not found');
    }

    if (!type) {
      throw new BadRequestException('Type not found');
    }

    const { sharpImage, metadata, sha1Hash } = await this.processImage(file);

    const allowedExtensionsMap = {
      [FileType.MOCKUP]: /(jpg|jpeg|png|webp)$/i,
      [FileType.ARTWORK]: /(png)$/i,
      [FileType.PRODUCT_IMAGE]: /(jpg|jpeg|png|webp)$/i,
    };

    const allowedExtensions: RegExp = allowedExtensionsMap[type];
    this.validateFileFormat(allowedExtensions, type, metadata.format);
    this.validateImageDimensions(metadata.width || 0, metadata.height || 0, type);
    this.validateDpi(type, metadata.density || 0);

    const existedFile = await this.fileRepository.findOne(
      { sha1: sha1Hash },
      { select: ['preview', 'previewFolder'], lean: false },
    );

    if (existedFile) {
      const previewLink = existedFile.parseImageUrls();

      if (type === FileType.ARTWORK) {
        const existedArtwork = await this.artworkRepository.findOne({
          fileName: file.originalname,
          file: existedFile._id,
        });

        if (existedArtwork) {
          return { _id: existedArtwork._id.toString(), preview: previewLink };
        }

        const artwork = await this.createArtwork(file, existedFile, metadata, user);

        return { _id: artwork._id.toString(), preview: previewLink };
      }

      if (type === FileType.MOCKUP) {
        const existedMockup = await this.mockupRepository.findOne({
          fileName: file.originalname,
          file: existedFile._id,
        });

        if (existedMockup) {
          return { _id: existedMockup._id.toString(), preview: previewLink };
        }

        const mockup = await this.createMockup(file, existedFile, metadata, user);

        return { _id: mockup._id.toString(), preview: previewLink };
      }
    }

    const { preview, width: previewWidth, quality: previewQuality } = await this.createPreview(file, sharpImage, type);
    const bucketName = this.getBucketName(type);
    const [uploadedFile, uploadedPreview] = await Promise.all([
      this.awsS3Service.uploadImage(file, bucketName),
      this.awsS3Service.uploadImage(preview, bucketName, FolderType.PREVIEW),
    ]);

    const thumbnailObj = { width: 0, quality: 0 };
    let uploadedThumbnail: UploadFileDto = { key: '' };

    if (shouldUploadThumbnail) {
      const {
        thumbnail,
        width: thumbnailWidth,
        quality: thumbnailQuality,
      } = await this.createThumbnail(file, sharpImage, type);
      thumbnailObj.width = thumbnailWidth;
      thumbnailObj.quality = thumbnailQuality;
      uploadedThumbnail = await this.awsS3Service.uploadImage(thumbnail, bucketName);
    }

    const { key, bucket, region, folder, fileId } = uploadedFile;

    const uploadFile = await this.fileRepository.create({
      key,
      fileId,
      mimeType: file.mimetype,
      fileSize: file.size,
      bucket,
      region,
      folder,
      previewFolder: uploadedPreview.folder,
      previewFileId: uploadedPreview.fileId,
      sha1: sha1Hash,
      thumbnail: uploadedThumbnail.key || '',
      thumbnailFileId: uploadedThumbnail.fileId || '',
      preview: uploadedPreview.key,
      type,
      dpi: metadata.density,
      previewQuality,
      previewWidth,
      thumbnailWidth: thumbnailObj.width,
      thumbnailQuality: thumbnailObj.quality,
      owner: user?._id,
    });

    const previewLink = uploadFile.parseImageUrls();

    if (type === FileType.ARTWORK) {
      const artwork = await this.createArtwork(file, uploadFile, metadata, user);

      return { _id: artwork._id.toString(), preview: previewLink };
    }

    if (type === FileType.MOCKUP) {
      const mockup = await this.createMockup(file, uploadFile, metadata, user);

      return { _id: mockup._id.toString(), preview: previewLink };
    }

    return { _id: uploadFile._id.toString(), preview: previewLink };
  }

  async deleteUnusedFiles(): Promise<boolean> {
    const bucketId = await this.backblazeService.getListBucket('zictok-dev');
    const cloudItems = await this.backblazeService.getListFileName(bucketId);
    const files = await this.fileRepository.findAll({}, { select: ['key', 'preview', 'thumbnail', 'folder'] });

    const localItems: string[] = [];

    for (const file of files) {
      const { key, preview, thumbnail, folder, previewFolder, thumbnailFolder } = file;

      if (key && folder) {
        localItems.push(`${folder}/${key}`);
      }

      if (preview && previewFolder) {
        localItems.push(`${previewFolder}/${preview}`);
      }

      if (thumbnail && thumbnailFolder) {
        localItems.push(`${thumbnailFolder}/${thumbnail}`);
      }
    }

    const cloudItemNames = cloudItems.map((item) => item.fileName);
    const removeFiles = cloudItemNames.filter((item: string) => !localItems.includes(item));
    const uniqueRemoveFiles = [...new Set(removeFiles)];

    if (uniqueRemoveFiles.length === 0) {
      throw new BadRequestException('No files to delete');
    }

    const deleteObject = cloudItems.filter((object) => uniqueRemoveFiles.includes(object.fileName));
    await this.backblazeService.deleteFiles(deleteObject);

    // eslint-disable-next-line no-console
    console.log(deleteObject.map((d, index) => `${index + 1} • ${d.fileName}`).join('\n'));

    return true;
  }

  private async createArtwork(
    file: IFile,
    uploadFile: FileEntity,
    metadata: sharp.Metadata,
    user?: UserEntity,
  ): Promise<ArtworkEntity> {
    return await this.artworkRepository.create({
      fileName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      file: uploadFile,
      width: metadata.width || 0,
      height: metadata.height || 0,
      owner: user?._id,
    });
  }

  private async createMockup(
    file: IFile,
    uploadFile: FileEntity,
    metadata: sharp.Metadata,
    user?: UserEntity,
  ): Promise<MockupEntity> {
    return await this.mockupRepository.create({
      fileName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      file: uploadFile,
      width: metadata.width || 0,
      height: metadata.height || 0,
      owner: user?._id,
    });
  }

  private async processImage(
    file: IFile,
  ): Promise<{ sharpImage: sharp.Sharp; metadata: sharp.Metadata; sha1Hash: string }> {
    let sharpImage: sharp.Sharp;
    let metadata: sharp.Metadata;

    const sha1 = crypto.createHash('sha1');
    sha1.update(file.buffer);
    const sha1Hash = sha1.digest('hex');

    try {
      sharpImage = sharp(file.buffer);
      metadata = await sharpImage.metadata();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Get metadata from sharp image error: ${error}`);

      throw new BadRequestException('Check image link');
    }

    return { sharpImage, metadata, sha1Hash };
  }

  private validateFileFormat(allowedExtensions: RegExp, type: FileType, format?: string): void {
    const uploadErrorMessage = {
      [FileType.MOCKUP]: 'Invalid image file',
      [FileType.ARTWORK]: 'Artwork only support png file',
      [FileType.PRODUCT_IMAGE]: 'Invalid image file',
    };

    if (!allowedExtensions.test(format || '')) {
      throw new BadRequestException(uploadErrorMessage[type]);
    }
  }

  private validateImageDimensions(width: number, height: number, type: FileType): void {
    if (type === FileType.PRODUCT_IMAGE) {
      if (width !== height) {
        throw new BadRequestException('Product image must be square');
      }

      if (width >= 3000 || height >= 3000 || width < 1000 || height < 1000) {
        throw new BadRequestException('Product image must be less than 3000x3000 and bigger than 1000x1000');
      }
    } else if (type === FileType.ARTWORK && (width >= 8000 || height >= 8000 || width <= 600 || height <= 600)) {
      throw new BadRequestException('Artwork image must be be less than 8000x8000 and  bigger than 600x600');
    } else if (type === FileType.MOCKUP && (width >= 2000 || height >= 2000 || width <= 300 || height <= 300)) {
      throw new BadRequestException('Mockup image must be less than 3000x3000 and bigger than 300x300');
    }
  }

  private validateDpi(type: FileType, dpi: number): void {
    if (type === FileType.ARTWORK && dpi < 72) {
      throw new BadRequestException('Artwork image must be more than 72 DPI');
    }
  }

  private async createPreview(
    file: IFile,
    sharpImage: sharp.Sharp,
    type: FileType,
  ): Promise<{ preview: IFile; quality: number; width: number }> {
    const previewSizeMap = {
      [FileType.MOCKUP]: { quality: 80, width: 600 },
      [FileType.ARTWORK]: { quality: 90, width: 500 },
      [FileType.PRODUCT_IMAGE]: { quality: 100, width: 600 },
    };

    const { quality, width } = previewSizeMap[type];

    const preview: IFile = { ...file, fieldname: `${file.fieldname}-preview`, mimetype: 'image/webp' };
    preview.buffer = await sharpImage.clone().webp({ quality }).resize(width).toBuffer();

    return { preview, quality, width };
  }

  private getBucketName(type: FileType): string {
    const bucketNameMap = {
      [FileType.MOCKUP]: this.configService.awsS3Config.mockupsBucketName,
      [FileType.ARTWORK]: this.configService.awsS3Config.artworksBucketName,
      [FileType.PRODUCT_IMAGE]: this.configService.awsS3Config.bucketName,
    };

    return bucketNameMap[type];
  }

  private async createThumbnail(
    file: IFile,
    sharpImage: sharp.Sharp,
    type: FileType,
  ): Promise<{ thumbnail: IFile; quality: number; width: number }> {
    const thumbnailSizeMap = {
      [FileType.MOCKUP]: { quality: 80, width: 300 },
      [FileType.ARTWORK]: { quality: 90, width: 300 },
      [FileType.PRODUCT_IMAGE]: { quality: 100, width: 300 },
    };

    const { quality, width } = thumbnailSizeMap[type];

    const thumbnail: IFile = { ...file, fieldname: `${file.fieldname}-thumbnail`, mimetype: 'image/jpeg' };
    thumbnail.buffer = await sharpImage.clone().jpeg({ quality }).resize(width).toBuffer();

    return { thumbnail, quality, width };
  }

  async inactiveFiles(ids: string[] | Types.ObjectId[]): Promise<boolean> {
    const fileIds = ids.map((id) => (typeof id === 'string' ? new Types.ObjectId(id) : id));

    return await this.fileRepository.updateMany({ _id: { $in: fileIds } }, { status: 'inactive' });
  }

  async activeFiles(ids: string[] | Types.ObjectId[]): Promise<boolean> {
    const fileIds = ids.map((id) => (typeof id === 'string' ? new Types.ObjectId(id) : id));

    return await this.fileRepository.updateMany({ _id: { $in: fileIds } }, { status: 'active' });
  }
}
