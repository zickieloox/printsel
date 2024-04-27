import { Parser } from '@json2csv/plainjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { PageOptionsDto } from 'core';
import { PageDto } from 'core';
import mongoose, { Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE, ExportType, Status } from 'shared';
import * as XLSX from 'xlsx';

import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';
import { FileRepository } from '@/modules/upload/file.repository';
import type { UserEntity } from '@/modules/user/user.entity';

import { CategoryRepository } from '../category/category.repository';
import type { ProductVariantDocument } from '../product-variant/product-variant.entity';
import type { CreateProductDto } from './dtos/create-product.dto';
import type { SyncProductToFactoryDto } from './dtos/sync-product-to-factory.dto';
import type { UpdateProductDto } from './dtos/update-product.dto';
import type { ProductEntity } from './product.entity';
import { ProductRepository } from './product.repository';

const customNanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private productVariantRepository: ProductVariantRepository,
    private categoryRepository: CategoryRepository,
    private fileRepository: FileRepository,
  ) {}

  async getProducts(pageOptionsDto: PageOptionsDto): Promise<PageDto> {
    const { search, limit, skip } = pageOptionsDto;

    const conditionKeyword = {
      $regex: search || '',
      $options: 'i',
    };

    const [products, total] = await this.productRepository.findAllAndCount(
      {
        $or: [{ title: conditionKeyword }, { productCode: conditionKeyword }],
      },
      {
        populate: [
          { path: 'mainImage', select: ['preview', 'previewFolder'] },
          { path: 'otherImages', select: ['preview', 'previewFolder'] },
          { path: 'category', select: ['name'] },
          {
            path: 'variants',
            select: [
              '_id',
              'name',
              'code',
              'status',
              'description',
              'quantity',
              'price',
              'baseCost',
              'sku',
              'color',
              'size',
              'style',
            ],
          },
        ],
        paging: {
          limit,
          skip,
        },
        sort: {
          updatedAt: ENUM_PAGINATION_ORDER_DIRECTION_TYPE.DESC,
        },
        lean: false,
      },
    );

    // Format image products
    for (const product of products) {
      const mainImage = product.mainImage;
      const otherImages = product.otherImages;

      const link = mainImage.parseImageUrls() || '';
      product.mainImage = link;

      if (otherImages.length > 0) {
        for (let i = 0; i < otherImages.length; i++) {
          const otherImage = otherImages[i];
          const otherImageLink = otherImage.parseImageUrls();
          otherImages[i] = otherImageLink;
        }

        product.otherImages = otherImages;
      } else {
        product.otherImages = []; // If no otherImages, set it as an empty array
      }
    }

    return new PageDto(products, total);
  }

  async createProduct(createProductDto: CreateProductDto, user: UserEntity): Promise<ProductEntity> {
    const imageObjectIds = [createProductDto.mainImageId, ...createProductDto.otherImageIds].map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    if (imageObjectIds.length < 2) {
      throw new BadRequestException('Product must have at least two images');
    }

    // Create new variants
    const newVariants = createProductDto.variants.filter((variant) => variant.isNew);
    const oldVariants = createProductDto.variants.filter((variant) => variant.Id);
    const newProductVariants = await this.productVariantRepository.createMany(
      newVariants.map((newVariant) => ({
        ...newVariant,
        code: customNanoid(8),
        createdBy: user,
        updatedBy: user,
      })),
    );

    const variantId = newProductVariants.map((v) => v._id);

    // Active image
    await this.fileRepository.updateMany({ _id: { $in: imageObjectIds } }, { status: Status.Active });

    return this.productRepository.create({
      ...createProductDto,
      mainImage: new mongoose.Types.ObjectId(createProductDto.mainImageId),
      category: new mongoose.Types.ObjectId(createProductDto.categoryId),
      variants: [...variantId, ...oldVariants],
      createdBy: user,
      updatedBy: user,
    });
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto, user: UserEntity): Promise<ProductEntity> {
    const imageObjectIds = [updateProductDto.mainImageId, ...updateProductDto.otherImageIds].map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    if (imageObjectIds.length < 2) {
      throw new BadRequestException('Product must have at least two images');
    }

    const oldVariants = updateProductDto.variants.filter((variant) => variant.Id && !variant.isEdited);
    const editedVariants = updateProductDto.variants.filter((variant) => variant.Id && variant.isEdited);
    const newVariants = updateProductDto.variants.filter((variant) => !variant.Id);

    const newProductVariants = await this.productVariantRepository.createMany(
      newVariants.map((newVariant) => {
        const newVariantsData = {
          ...newVariant,
          code: customNanoid(8),
          updatedBy: user,
        };

        delete newVariantsData.Id;

        return newVariantsData;
      }),
    );

    const bulkUpdate = [];

    for (const editedVariant of editedVariants) {
      const updateData = {
        ...editedVariant,
        updatedBy: user,
      };

      delete updateData.Id;

      if (editedVariant.Id) {
        bulkUpdate.push(this.productVariantRepository.findOneByIdAndUpdate(editedVariant.Id, updateData));
      }
    }

    const updatedProductVariants = await Promise.all(bulkUpdate);

    const oldIds = oldVariants.map((v) => v.Id);
    const variantId = newProductVariants.map((v) => v._id);
    const updatedId = updatedProductVariants.filter((v): v is ProductVariantDocument => v !== null).map((v) => v._id);

    const product = await this.productRepository.findOneByIdAndUpdate(productId, {
      ...updateProductDto,
      mainImage: new mongoose.Types.ObjectId(updateProductDto.mainImageId),
      otherImages: updateProductDto.otherImageIds.map((item) => new mongoose.Types.ObjectId(item)),
      category: new mongoose.Types.ObjectId(updateProductDto.categoryId),
      variants: [...variantId, ...updatedId, ...oldIds],
      updatedBy: user,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Handle image status
    const currentImageIds = [...product.otherImages, product.mainImage].map((image) => image._id);
    const newImageIds = [...updateProductDto.otherImageIds, updateProductDto.mainImageId].map((image) => image);
    const inactiveImageIds = currentImageIds.filter((image) => !newImageIds.includes(`${image}`));
    const activeImageIds = newImageIds.filter((image) => !currentImageIds.includes(new Types.ObjectId(image)));

    // if (`${product.mainImage._id}` !== updateProductDto.mainImageId) {
    //   inactiveImageIds.push(product.mainImage._id);
    //   activeImageIds.push(updateProductDto.mainImageId);
    // }

    await this.fileRepository.updateMany({ _id: { $in: inactiveImageIds } }, { status: Status.INACTIVE });
    await this.fileRepository.updateMany({ _id: { $in: activeImageIds } }, { status: Status.Active });

    return product;
  }

  async getProductDetail(productId: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOneById(productId, {
      populate: [
        { path: 'mainImage', select: ['preview', 'previewFolder'] },
        { path: 'otherImages', select: ['preview', 'previewFolder'] },
        { path: 'category', select: ['name'] },
        {
          path: 'variants',
          select: ['name', 'description', 'quantity', 'price', 'baseCost', 'sku', 'color', 'size', 'style', 'status'],
        },
      ],
      lean: false,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const mainImage = product.mainImage;
    const otherImages = product.otherImages;

    product.mainImage.preview = mainImage.parseImageUrls();

    for (const otherImage of otherImages) {
      otherImage.preview = otherImage.parseImageUrls();
    }

    return product;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return await this.productRepository.softDeleteById(productId);
  }

  async getAllProducts(): Promise<ProductEntity[]> {
    const products = await this.productRepository.findAll(
      {},
      {
        populate: [
          { path: 'mainImage', select: ['preview', 'previewFolder'] },
          { path: 'otherImages', select: ['preview', 'previewFolder'] },
        ],
        select: ['title', 'price', 'mainImage', 'variants', 'createdAt', 'category'],
        lean: false,
      },
    );

    // Format image products
    for (const product of products) {
      const mainImage = product.mainImage;
      const otherImages = product.otherImages;

      const link = mainImage.parseImageUrls();
      product.mainImage = link;

      if (otherImages.length > 0) {
        for (let i = 0; i < otherImages.length; i++) {
          const otherImage = otherImages[i];
          const otherImageLink = otherImage.parseImageUrls();
          otherImages[i] = otherImageLink;
        }

        product.otherImages = otherImages;
      } else {
        product.otherImages = []; // If no otherImages, set it as an empty array
      }
    }

    return products;
  }

  async export(type: ExportType): Promise<Buffer> {
    const csvFields = [
      'productName',
      'variantName',
      'title',
      'category',
      'price',
      'code',
      'style',
      'color',
      'size',
      'updatedAt',
    ];

    const allProducts = await this.productRepository.findAll(
      {},
      {
        select: ['variants', 'title'],
        populate: [
          {
            path: 'variants',
            select: ['name', 'sku', 'color', 'size', 'style', 'price', 'code', 'updatedAt'],
          },
          {
            path: 'category',
            select: ['name'],
          },
        ],
      },
    );

    const products = allProducts.map((product) =>
      product.variants.map((variant) => {
        const { name, color, size, style, price, code, updatedAt } = variant;

        return {
          productName: product.title,
          variantName: name,
          title: product.title,
          category: product.category.name,
          price,
          code,
          style,
          color,
          size,
          updatedAt,
        };
      }),
    );

    const flattedProducts = products.flat();

    if (type === ExportType.XLSX) {
      const worksheet = XLSX.utils.json_to_sheet(flattedProducts, { header: csvFields });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      const excelBuffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer> = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      return Buffer.from(excelBuffer);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const csvParser = new Parser({ csvFields } as any);

    const csvData: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: 'string'): string } =
      csvParser.parse(flattedProducts);

    return Buffer.from(csvData, 'utf8');
  }

  async syncToFactory(syncProductToFactoryDto: SyncProductToFactoryDto): Promise<unknown> {
    const { latestProductUpdatedAt, latestProductVariantUpdatedAt, latestCategoryUpdatedAt } = syncProductToFactoryDto;

    const products = await this.productRepository.findAll(
      { updatedAt: { $gte: latestProductUpdatedAt } },
      {
        lean: false,
        populate: [
          { path: 'mainImage', select: ['preview', 'previewFolder'] },
          { path: 'otherImages', select: ['preview', 'previewFolder'] },
        ],
      },
    );
    const productVariants = await this.productVariantRepository.findAll({
      updatedAt: { $gte: latestProductVariantUpdatedAt },
    });
    const categories = await this.categoryRepository.findAll({ updatedAt: { $gte: latestCategoryUpdatedAt } });

    for (const product of products) {
      const mainImage = product.mainImage;
      const otherImages = product.otherImages;

      const link = mainImage.parseImageUrls() || '';
      product.mainImage = link;

      if (otherImages.length > 0) {
        for (let i = 0; i < otherImages.length; i++) {
          const otherImage = otherImages[i];
          const otherImageLink = otherImage.parseImageUrls();
          otherImages[i] = otherImageLink;
        }

        product.otherImages = otherImages;
      } else {
        product.otherImages = []; // If no otherImages, set it as an empty array
      }
    }

    return {
      products,
      productVariants,
      categories,
    };
  }
}
