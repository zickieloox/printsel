import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateProductDto, GetProductsDto, GetProductsResDto } from 'shared';
import { ImageType, OrderDirection, Status } from 'shared';

import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';
import type { UserDocument } from '@/modules/user/user.entity';
import { genCode } from '@/utils';

import { CategoryRepository } from '../category/category.repository';
import type { ProductVariantEntity } from '../product-variant/product-variant.entity';
import { ImageRepository } from '../upload/image.repository';
import type { ProductEntity } from './product.entity';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private productVariantRepository: ProductVariantRepository,
    private categoryRepository: CategoryRepository,
    private imageRepository: ImageRepository,
  ) {}

  async getProducts(getProductsDto: GetProductsDto): Promise<GetProductsResDto> {
    const { search, limit, page } = getProductsDto;

    const conditionKeyword = {
      $regex: search || '',
      $options: 'i',
    };

    const { data: products, total } = await this.productRepository.findAllAndCount(
      {
        $or: [{ title: conditionKeyword }, { productCode: conditionKeyword }],
      },
      {
        populate: [
          { path: 'images', select: ['url', 'previewUrl', 'thumbUrl'] },
          { path: 'category', select: ['name'] },
          {
            path: 'variants',
            select: ['title', 'productId', 'code', 'sku', 'option1', 'option2', 'option3', 'option4', 'price'],
          },
        ],
        paging: {
          limit,
          skip: limit * (page - 1),
        },
        sort: {
          updatedAt: OrderDirection.DESC,
        },
        lean: false,
      },
    );

    for (const product of products) {
      for (const image of product.images!) {
        image.parseUrls();
      }
    }

    return {
      // @ts-expect-error data
      data: products,
      total,
    };
  }

  async createProduct(createProductDto: CreateProductDto, user: UserDocument): Promise<ProductEntity> {
    if (createProductDto.imageIds.length < 2) {
      throw new BadRequestException('Product must have at least two images');
    }

    // Validate images
    const images = await this.imageRepository.findAll({
      _id: { $in: createProductDto.imageIds },
      type: ImageType.ProductImage,
    });

    console.log(images);

    if (images.length !== createProductDto.imageIds.length) {
      throw new BadRequestException('Invalid images');
    }

    const productData: ProductEntity = {
      ...createProductDto,
      createdById: user._id,
      updatedById: user._id,
    };

    const newProduct = await this.productRepository.create(productData);

    // Create new variants
    const newVariantsData: Array<Partial<ProductVariantEntity>> = createProductDto.variants.map((newVariant) => {
      const code = genCode();
      const sku = newVariant.sku || code;

      return {
        ...newVariant,
        productId: newProduct._id,
        baseCost: newVariant.price,
        code,
        sku,
        createdById: user._id,
        updatedById: user._id,
      };
    });

    const newProductVariants = await this.productVariantRepository.createMany(newVariantsData);

    console.log(newProductVariants);

    const variantIds = newProductVariants.map((v) => v._id);

    // Activate product images
    await this.imageRepository.updateMany({ _id: { $in: createProductDto.imageIds } }, { status: Status.Active });

    await this.productRepository.updateOne({ _id: newProduct._id }, { variantIds });

    return newProduct;
  }

  // async updateProduct(productId: string, updateProductDto: UpdateProductDto, user: UserDocument): Promise<ProductEntity> {
  //   const imageObjectIds = [updateProductDto.mainImageId, ...updateProductDto.otherImageIds].map(
  //     (id) => new mongoose.Types.ObjectId(id),
  //   );

  //   if (imageObjectIds.length < 2) {
  //     throw new BadRequestException('Product must have at least two images');
  //   }

  //   const oldVariants = updateProductDto.variants.filter((variant) => variant.Id && !variant.isEdited);
  //   const editedVariants = updateProductDto.variants.filter((variant) => variant.Id && variant.isEdited);
  //   const newVariants = updateProductDto.variants.filter((variant) => !variant.Id);

  //   const newProductVariants = await this.productVariantRepository.createMany(
  //     newVariants.map((newVariant) => {
  //       const newVariantsData = {
  //         ...newVariant,
  //         code: customNanoid(8),
  //         updatedBy: user,
  //       };

  //       delete newVariantsData.Id;

  //       return newVariantsData;
  //     }),
  //   );

  //   const bulkUpdate = [];

  //   for (const editedVariant of editedVariants) {
  //     const updateData = {
  //       ...editedVariant,
  //       updatedBy: user,
  //     };

  //     delete updateData.Id;

  //     if (editedVariant.Id) {
  //       bulkUpdate.push(this.productVariantRepository.findOneByIdAndUpdate(editedVariant.Id, updateData));
  //     }
  //   }

  //   const updatedProductVariants = await Promise.all(bulkUpdate);

  //   const oldIds = oldVariants.map((v) => v.Id);
  //   const variantId = newProductVariants.map((v) => v._id);
  //   const updatedId = updatedProductVariants.filter((v): v is ProductVariantDocument => v !== null).map((v) => v._id);

  //   const product = await this.productRepository.findOneByIdAndUpdate(productId, {
  //     ...updateProductDto,
  //     mainImage: new mongoose.Types.ObjectId(updateProductDto.mainImageId),
  //     otherImages: updateProductDto.otherImageIds.map((item) => new mongoose.Types.ObjectId(item)),
  //     category: new mongoose.Types.ObjectId(updateProductDto.categoryId),
  //     variants: [...variantId, ...updatedId, ...oldIds],
  //     updatedBy: user,
  //   });

  //   if (!product) {
  //     throw new BadRequestException('Product not found');
  //   }

  //   // Handle image status
  //   const currentImageIds = [...product.otherImages, product.mainImage].map((image) => image._id);
  //   const newImageIds = [...updateProductDto.otherImageIds, updateProductDto.mainImageId].map((image) => image);
  //   const inactiveImageIds = currentImageIds.filter((image) => !newImageIds.includes(`${image}`));
  //   const activeImageIds = newImageIds.filter((image) => !currentImageIds.includes(new Types.ObjectId(image)));

  //   // if (`${product.mainImage._id}` !== updateProductDto.mainImageId) {
  //   //   inactiveImageIds.push(product.mainImage._id);
  //   //   activeImageIds.push(updateProductDto.mainImageId);
  //   // }

  //   await this.imageRepository.updateMany({ _id: { $in: inactiveImageIds } }, { status: Status.Inactive });
  //   await this.imageRepository.updateMany({ _id: { $in: activeImageIds } }, { status: Status.Active });

  //   return product;
  // }

  async getProductDetail(productId: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOneById(productId, {
      populate: [
        { path: 'images', select: ['previewUrl', 'url', 'thumbUrl'] },
        { path: 'category', select: ['name'] },
        {
          path: 'variants',
          select: ['title', 'productId', 'code', 'sku', 'option1', 'option2', 'option3', 'option4', 'price'],
        },
      ],
      lean: false,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    for (const image of product.images!) {
      image.parseUrls();
    }

    return product;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return await this.productRepository.softDelete({ _id: productId });
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
      for (const image of product.images!) {
        image.parseUrls();
      }
    }

    return products;
  }

  // async export(type: ExportType): Promise<Buffer> {
  //   const csvFields = [
  //     'productName',
  //     'variantName',
  //     'title',
  //     'category',
  //     'price',
  //     'code',
  //     'style',
  //     'color',
  //     'size',
  //     'updatedAt',
  //   ];

  //   const allProducts = await this.productRepository.findAll(
  //     {},
  //     {
  //       select: ['variants', 'title'],
  //       populate: [
  //         {
  //           path: 'variants',
  //           select: ['name', 'sku', 'color', 'size', 'style', 'price', 'code', 'updatedAt'],
  //         },
  //         {
  //           path: 'category',
  //           select: ['name'],
  //         },
  //       ],
  //     },
  //   );

  //   const products = allProducts.map((product) =>
  //     product.variants.map((variant) => {
  //       const { name, color, size, style, price, code, updatedAt } = variant;

  //       return {
  //         productName: product.title,
  //         variantName: name,
  //         title: product.title,
  //         category: product.category.name,
  //         price,
  //         code,
  //         style,
  //         color,
  //         size,
  //         updatedAt,
  //       };
  //     }),
  //   );

  //   const flattedProducts = products.flat();

  //   if (type === ExportType.XLSX) {
  //     const worksheet = XLSX.utils.json_to_sheet(flattedProducts, { header: csvFields });
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  //     const excelBuffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer> = XLSX.write(workbook, {
  //       type: 'buffer',
  //       bookType: 'xlsx',
  //     });

  //     return Buffer.from(excelBuffer);
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  //   const csvParser = new Parser({ csvFields } as any);

  //   const csvData: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: 'string'): string } =
  //     csvParser.parse(flattedProducts);

  //   return Buffer.from(csvData, 'utf8');
  // }
}
