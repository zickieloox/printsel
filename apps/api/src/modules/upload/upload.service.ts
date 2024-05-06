import { BadRequestException, Injectable } from '@nestjs/common';
import type { IFile, UploadedFileDto } from 'core';
import { AwsS3Service, BackblazeService } from 'core';
import crypto from 'crypto';
import type { ResImageDto } from 'shared';
import { ImageType, myNanoid, Status } from 'shared';
import sharp from 'sharp';

import type { UserDocument } from '@/modules/user/user.entity';
import { ApiConfigService } from '@/shared/services';

import type { ImageDocument, ImageEntity } from './image.entity';
import { ImageRepository } from './image.repository';
import { UniqueImageRepository } from './unique-image.repository';

const MIN_DPI = 72;
const ORIGINAL_SUFFIX = '-original';
const THUMBNAIL_SUFFIX = '-thumb';
const PREVIEW_SUFFIX = '-preview';

const IMAGE_EXTENSIONS = /(jpg|jpeg|png|webp)$/i;

type ImageConfig = Record<
  ImageType,
  {
    folder: string;
    allowedExtensions: RegExp;
    minDimensions: number[];
    maxDimensions: number[];
    isSquare?: boolean;
    hasThumbnail?: boolean;
    noPreview?: boolean;
    preview: { quality: number; width: number };
    thumbnail: { quality: number; width: number };
  }
>;

const IMAGE_CONFIG: ImageConfig = {
  [ImageType.ProductImage]: {
    folder: 'images',
    allowedExtensions: /(jpg|jpeg|png)$/i,
    isSquare: true,
    minDimensions: [1000, 1000],
    maxDimensions: [3000, 3000],
    hasThumbnail: true,
    preview: {
      quality: 100,
      width: 500,
    },
    thumbnail: {
      quality: 90,
      width: 200,
    },
  },
  [ImageType.Mockup]: {
    folder: 'u-images/mockup',
    allowedExtensions: /(jpg|jpeg|png|webp)$/i,
    minDimensions: [200, 200],
    maxDimensions: [10_000, 10_000],
    preview: {
      quality: 90,
      width: 500,
    },
    thumbnail: {
      quality: 80,
      width: 200,
    },
  },
  [ImageType.Artwork]: {
    folder: 'u-images/artwork',
    allowedExtensions: /(png)$/i,
    minDimensions: [1000, 1000],
    maxDimensions: [10_000, 10_000],
    hasThumbnail: true,
    preview: {
      quality: 90,
      width: 500,
    },
    thumbnail: {
      quality: 80,
      width: 200,
    },
  },
};

@Injectable()
export class UploadService {
  constructor(
    private imageRepository: ImageRepository,
    private uniqueImageRepository: UniqueImageRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly configService: ApiConfigService,
    private readonly backblazeService: BackblazeService,
  ) {}

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async uploadImage(type: ImageType, file: IFile, user: UserDocument): Promise<ResImageDto> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!file) {
      throw new BadRequestException('Upload image not found');
    }

    this.validateFileFormat(IMAGE_EXTENSIONS, file.originalname);

    const { sharpImage, metadata, sha1 } = await this.processImage(file);

    this.validateImageFormat(IMAGE_CONFIG[type].allowedExtensions, type, metadata.format);
    this.validateImageDimensions(metadata.width!, metadata.height!, type);
    this.validateDpi(type, metadata.density!);

    file.mimetype = `image/${metadata.format}`;

    // if (type === ImageType.Mockup || type === ImageType.Artwork) {
    //   return await this.createArtworkOrMockup(type, file, metadata, sharpImage, sha1, user);
    // }

    const uploadedImage = await this.createImage(type, file, user, sharpImage, metadata, sha1);
    uploadedImage.parseUrls();

    return {
      _id: uploadedImage._id,
      name: uploadedImage.fileName,
      url: uploadedImage.url,
      previewUrl: uploadedImage.previewUrl,
      thumbUrl: uploadedImage.thumbUrl,
    };
  }

  // private async createArtworkOrMockup(
  //   type: ImageType,
  //   file: IFile,
  //   user: UserDocument,
  //   sharpImage: sharp.Sharp,
  //   metadata: sharp.Metadata,
  //   sha1: string,
  // ): Promise<{ _id: string; previewUrl: string }> {
  //   const existingFile = await this.imageRepository.findOne(
  //     { sha1 },
  //     { select: ['preview', 'previewFolder'], lean: false },
  //   );

  //   if (existingFile) {
  //     existingFile.parseUrls();

  //     if (type === ImageType.Artwork) {
  //       const existingArtwork = await this.artworkRepository.findOne({
  //         fileName: file.originalname,
  //         file: existingFile._id,
  //         ownerId: user._id,
  //       });

  //       if (existingArtwork) {
  //         return { _id: existingArtwork._id, previewUrl };
  //       }

  //       const artwork = await this.createArtwork(file, existingFile, metadata, user);

  //       return { _id: artwork._id, previewUrl };
  //     }

  //     if (type === ImageType.Mockup) {
  //       const existedMockup = await this.mockupRepository.findOne({
  //         fileName: file.originalname,
  //         file: existingFile._id,
  //       });

  //       if (existedMockup) {
  //         return { _id: existedMockup._id, preview: previewLink };
  //       }

  //       const mockup = await this.createMockup(file, existingFile, metadata, user);

  //       return { _id: mockup._id, preview: previewLink };
  //     }
  //   }

  //   const { preview, width: previewWidth, quality: previewQuality } = await this.createPreview(file, sharpImage, type);
  //   const [uploadedFile, uploadedPreview] = await Promise.all([
  //     this.awsS3Service.uploadImage(file, this.configService.awsS3Config.imagesBucketName),
  //     this.awsS3Service.uploadImage(preview, this.configService.awsS3Config.imagesBucketName, PREVIEW_SUFFIX),
  //   ]);

  //   const thumbnailObj = { width: 0, quality: 0 };
  //   const uploadedThumbnail: UploadedFileDto;

  //   // if (shouldUploadThumbnail) {
  //   //   const {
  //   //     thumbnail,
  //   //     width: thumbnailWidth,
  //   //     quality: thumbnailQuality,
  //   //   } = await this.createThumbnail(file, sharpImage, type);
  //   //   thumbnailObj.width = thumbnailWidth;
  //   //   thumbnailObj.quality = thumbnailQuality;
  //   //   uploadedThumbnail = await this.awsS3Service.uploadImage(thumbnail, bucketName);
  //   // }

  //   const { key, bucket, region, fileId } = uploadedFile;

  //   const uploadFile = await this.imageRepository.create({
  //     key,
  //     objectId: fileId,
  //     mimetype: file.mimetype,
  //     fileSize: file.size,
  //     bucket,
  //     region,
  //     previewObjectId: uploadedPreview.fileId,
  //     sha1,
  //     thumbKey: uploadedThumbnail.key || '',
  //     thumbObjectId: uploadedThumbnail.fileId || '',
  //     previewKey: uploadedPreview.key,
  //     type,
  //     dpi: metadata.density,
  //     previewQuality,
  //     previewWidth,
  //     thumbWidth: thumbnailObj.width,
  //     thumbQuality: thumbnailObj.quality,
  //     ownerId: user._id,
  //   });

  //   uploadFile.parseUrls();

  //   if (type === ImageType.Artwork) {
  //     const artwork = await this.createArtwork(file, uploadFile, metadata, user);

  //     return { _id: artwork._id, preview: uploadFile.previewUrl };
  //   }

  //   if (type === ImageType.Mockup) {
  //     const mockup = await this.createMockup(file, uploadFile, metadata, user);

  //     return { _id: mockup._id, preview: uploadFile.previewUrl };
  //   }

  //   return { _id: uploadFile._id, preview: uploadFile.previewUrl };
  // }

  private async createImage(
    type: ImageType,
    file: IFile,
    user: UserDocument,
    sharpImage: sharp.Sharp,
    metadata: sharp.Metadata,
    sha1: string,
  ): Promise<ImageDocument> {
    const {
      preview,
      width: previewWidth,
      quality: previewQuality,
      height: previewHeight,
      fileSize: previewFileSize,
    } = await this.createPreview(file, sharpImage, metadata, type);
    console.log(file);

    const folder = IMAGE_CONFIG[type].folder;
    const imageId = myNanoid();

    const result = await Promise.all([
      this.awsS3Service.uploadImage(
        imageId,
        file,
        this.configService.awsS3Config.imagesBucketName,
        folder + ORIGINAL_SUFFIX,
      ),
      this.awsS3Service.uploadImage(
        imageId,
        preview,
        this.configService.awsS3Config.imagesBucketName,
        folder + PREVIEW_SUFFIX,
      ),
    ]);

    const uploadedOriginal: UploadedFileDto = result[0];
    const uploadedPreview: UploadedFileDto = result[1];

    const imageData: ImageEntity = {
      type,
      ownerId: user._id,
      key: uploadedOriginal.key,
      mimetype: file.mimetype,
      region: uploadedOriginal.region,
      objectId: uploadedOriginal.objectId,
      bucket: uploadedOriginal.bucket,
      fileSize: file.size,
      sha1,
      status: Status.Inactive,
      fileName: file.originalname,

      width: metadata.width!,
      height: metadata.height!,
      dpi: metadata.density!,
      url: uploadedOriginal.url,

      previewObjectId: uploadedPreview.objectId,
      previewKey: uploadedPreview.key,
      previewQuality,
      previewWidth,
      previewHeight,
      previewUrl: uploadedPreview.url,
      previewFileSize,
    };

    if (IMAGE_CONFIG[type].hasThumbnail) {
      const { thumbnail, width, height, quality, fileSize } = await this.createThumbnail(
        file,
        sharpImage,
        metadata,
        type,
      );
      imageData.thumbWidth = width;
      imageData.thumbHeight = height;
      imageData.thumbQuality = quality;
      imageData.thumbFileSize = fileSize;

      const uploadedThumbnail = await this.awsS3Service.uploadImage(
        imageId,
        thumbnail,
        this.configService.awsS3Config.imagesBucketName,
        folder + THUMBNAIL_SUFFIX,
      );

      imageData.thumbKey = uploadedThumbnail.key;
      imageData.thumbUrl = uploadedThumbnail.url;
      imageData.thumbObjectId = uploadedThumbnail.objectId;
    }

    return await this.imageRepository.create(imageData);
  }

  // private async createArtwork(
  //   file: IFile,
  //   uploadFile: UniqueImageEntity,
  //   metadata: sharp.Metadata,
  //   user?: UserDocument,
  // ): Promise<ArtworkDocument> {
  //   return await this.artworkRepository.create({
  //     fileName: file.originalname,
  //     mimetype: file.mimetype,
  //     size: file.size,
  //     imageId: uploadFile._id,
  //     width: metadata.width,
  //     height: metadata.height,
  //     ownerId: user?._id,
  //   });
  // }

  // private async createMockup(
  //   file: IFile,
  //   uploadFile: UniqueImageEntity,
  //   metadata: sharp.Metadata,
  //   user?: UserDocument,
  // ): Promise<MockupDocument> {
  //   return await this.mockupRepository.create({
  //     fileName: file.originalname,
  //     mimetype: file.mimetype,
  //     size: file.size,
  //     imageId: uploadFile._id,
  //     width: metadata.width,
  //     height: metadata.height,
  //     ownerId: user?._id,
  //   });
  // }

  private validateFileFormat(allowedExtensions: RegExp, fileName: string): void {
    const format = fileName.split('.').pop();

    if (!format || !allowedExtensions.test(format)) {
      throw new BadRequestException('Unsupported file format');
    }
  }

  private async processImage(
    file: IFile,
  ): Promise<{ sharpImage: sharp.Sharp; metadata: sharp.Metadata; sha1: string }> {
    let sharpImage: sharp.Sharp;
    let metadata: sharp.Metadata;

    const sha1 = crypto.createHash('sha1');
    sha1.update(file.buffer);

    try {
      sharpImage = sharp(file.buffer);
      metadata = await sharpImage.metadata();
    } catch {
      throw new BadRequestException('Cannot get image metadata');
    }

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Cannot get image dimensions');
    }

    if (!metadata.density) {
      throw new BadRequestException('Cannot get image dpi');
    }

    return { sharpImage, metadata, sha1: sha1.digest('hex') };
  }

  private validateImageFormat(allowedExtensions: RegExp, type: ImageType, format?: string): void {
    const uploadErrorMessage = {
      [ImageType.Mockup]: 'Invalid mockup file',
      [ImageType.Artwork]: 'Artwork only support png file',
      [ImageType.ProductImage]: 'Invalid product image file',
    };

    if (!format || !allowedExtensions.test(format)) {
      throw new BadRequestException(uploadErrorMessage[type]);
    }
  }

  private validateImageDimensions(width: number, height: number, type: ImageType): void {
    if (IMAGE_CONFIG[type].isSquare && width !== height) {
      throw new BadRequestException('Image must be square');
    }

    const minDimensions = IMAGE_CONFIG[type].minDimensions;
    const maxDimensions = IMAGE_CONFIG[type].maxDimensions;

    if (
      width < minDimensions[0] ||
      height < minDimensions[0] ||
      width > maxDimensions[0] ||
      height > maxDimensions[1]
    ) {
      throw new BadRequestException(
        `Image must be bigger than ${minDimensions.join('x')} and less than ${maxDimensions}`,
      );
    }
  }

  private validateDpi(type: ImageType, dpi: number): void {
    if (type === ImageType.Artwork && dpi < MIN_DPI) {
      throw new BadRequestException(`Artwork image must be more than ${MIN_DPI} DPI`);
    }
  }

  private async createPreview(
    file: IFile,
    sharpImage: sharp.Sharp,
    metadata: sharp.Metadata,
    type: ImageType,
  ): Promise<{ preview: IFile; quality: number; width: number; height: number; fileSize: number }> {
    const { quality, width } = IMAGE_CONFIG[type].preview;

    const preview: IFile = { ...file, fieldname: file.fieldname, mimetype: 'image/webp' };
    const previewImage = await sharpImage.clone().resize(width).webp({ quality }).toBuffer({ resolveWithObject: true });
    const height = previewImage.info.height;
    // @ts-expect-error buffer
    preview.buffer = previewImage.data.buffer;

    const fileSize = previewImage.data.byteLength;

    return { preview, quality, width, height, fileSize };
  }

  private async createThumbnail(
    file: IFile,
    sharpImage: sharp.Sharp,
    metadata: sharp.Metadata,
    type: ImageType,
  ): Promise<{ thumbnail: IFile; quality: number; width: number; height: number; fileSize: number }> {
    const { quality, width } = IMAGE_CONFIG[type].thumbnail;

    const thumbnail: IFile = { ...file, fieldname: file.fieldname, mimetype: 'image/webp' };
    const thumbnailImage = await sharpImage
      .clone()
      .resize(width)
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    const height = thumbnailImage.info.height;
    // @ts-expect-error buffer
    thumbnail.buffer = thumbnailImage.data.buffer;

    const fileSize = thumbnailImage.data.byteLength;

    return { thumbnail, quality, width, height, fileSize };
  }

  // async deleteUnusedFiles(): Promise<boolean> {
  //   const bucketId = await this.backblazeService.getListBucket('zictok-dev');
  //   const cloudItems = await this.backblazeService.getListFileName(bucketId);
  //   const files = await this.imageRepository.findAll({}, { select: ['key', 'previewKey', 'thumbKey'] });

  //   const localItems: string[] = [];

  //   for (const file of files) {
  //     const { key, previewKey, thumbKey, folder, previewFolder, thumbFolder } = file;

  //     if (key && folder) {
  //       localItems.push(`${folder}/${key}`);
  //     }

  //     if (previewKey && previewFolder) {
  //       localItems.push(`${previewFolder}/${previewKey}`);
  //     }

  //     if (thumbKey && thumbFolder) {
  //       localItems.push(`${thumbFolder}/${thumbKey}`);
  //     }
  //   }

  //   const cloudItemNames = cloudItems.map((item) => item.fileName);
  //   const removeFiles = cloudItemNames.filter((item: string) => !localItems.includes(item));
  //   const uniqueRemoveFiles = [...new Set(removeFiles as string[])];

  //   if (uniqueRemoveFiles.length === 0) {
  //     throw new BadRequestException('No files to delete');
  //   }

  //   const deleteObject = cloudItems.filter((object) => uniqueRemoveFiles.includes(object.fileName as string));
  //   await this.backblazeService.deleteFiles(deleteObject);

  //   // eslint-disable-next-line no-console
  //   console.log(deleteObject.map((d, index) => `${index + 1} • ${d.fileName}`).join('\n'));

  //   return true;
  // }
}
