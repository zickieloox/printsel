/* eslint-disable quote-props */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import Bottleneck from 'bottleneck';
import console from 'console';
import { PageDto } from 'core';
import type { FilterQuery } from 'mongoose';
import mongoose, { Model, Types } from 'mongoose';
import {
  OrderDirection,
  OrderItemStatus,
  OrderStatus,
  OrderType,
  ShippingMethod,
  ShippingStatus,
  toCamelCase,
} from 'shared';

import { RoleType } from '@/constants';
import { CounterService } from '@/modules/counter/counter.service';
import { OrderItemRepository } from '@/modules/order-item/order-item.repository';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';
import { UploadService } from '@/modules/upload/upload.service';
import type { UserEntity } from '@/modules/user/user.entity';
import { ApiConfigService } from '@/shared/services';

import type { OrderItemEntity } from '../order-item/order-item.entity';
import type { CreateOrderDto } from './dtos/create-order.dto';
import { type GetOrdersDto, type GetStatisticDto } from './dtos/get-order.dto';
import type { SyncOrderToFactoryDto } from './dtos/sync-order-to-factory.dto';
import type { UpdateArtworkError } from './dtos/update-artwork-error.dto';
import type { UpdateNoteDto } from './dtos/update-note.dto';
import type { UpdateOrderFromFactoryDto } from './dtos/update-order-from-factory';
import type { IGetOrderDetailByBarcodeResponse } from './interfaces/get-order-by-barcode';
import type { PayOrdersDto } from './interfaces/pay-orders-dto';
import { OrderEntity } from './order.entity';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  downloadLimiter = new Bottleneck();

  uploadLimiter = new Bottleneck();

  constructor(
    @InjectModel(OrderEntity.name)
    private orderModel: Model<OrderEntity>,
    private orderRepository: OrderRepository,
    private orderItemRepository: OrderItemRepository,
    private productRepository: ProductRepository,
    private productVariantRepository: ProductVariantRepository,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly counterService: CounterService,
    private readonly configService: ApiConfigService,
    private readonly uploadService: UploadService,
  ) {
    this.downloadLimiter.updateSettings({
      maxConcurrent: Number(this.configService.bottleneck.downloadImagesMaxConcurrent),
    });
    this.downloadLimiter.on('failed', (error, jobInfo) => {
      const id = jobInfo.options.id;
      console.warn(`Job ${id} failed: ${error}`);

      if (jobInfo.retryCount === Number(this.configService.bottleneck.downloadImagesMaxRetry)) {
        // console.log(`Retrying download job ${id} in 500ms!`);

        return 500;
      }
    });

    this.uploadLimiter.updateSettings({
      maxConcurrent: Number(this.configService.bottleneck.downloadImagesMaxConcurrent),
    });
    this.uploadLimiter.on('failed', (error, jobInfo) => {
      const id = jobInfo.options.id;
      console.warn(`Job ${id} failed: ${error}`);

      if (jobInfo.retryCount === Number(this.configService.bottleneck.uploadImagesMaxRetry)) {
        // console.log(`Retrying upload job ${id} in 500ms!`);

        return 500;
      }
    });
  }

  async getStatistics(getStatisticDto: GetStatisticDto): Promise<Record<string, number>> {
    const { from, to } = getStatisticDto;

    const promises = Object.keys(OrderStatus).map(async (statusKey) => {
      const filterQuery: FilterQuery<OrderEntity> = {
        status: OrderStatus[statusKey as keyof typeof OrderStatus],
      };

      if (from && to) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        filterQuery.updatedAt = { $gte: new Date(from), $lte: new Date(to) };
      }

      const count = await this.orderModel.count({ ...filterQuery });

      return { [toCamelCase(statusKey)]: count };
    });

    const results = await Promise.all(promises);

    const statistic: Record<string, number> = {};
    let totalCount = 0;

    for (const result of results) {
      const [status, count] = Object.entries(result)[0];
      statistic[status] = count;
      totalCount += count;
    }

    statistic.total = totalCount;

    return statistic;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getOrders(getOrdersDto: GetOrdersDto, user: UserEntity): Promise<PageDto> {
    const { limit, skip, status, from, to, singleItems, storeCode, search } = getOrdersDto;

    console.log('search', search);

    const queryFilter: FilterQuery<OrderEntity> = {};

    if (user.role?.name !== RoleType.Admin) {
      queryFilter.user = user._id;
    }

    if (status) {
      queryFilter.status = status;
    }

    if (from && to) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      queryFilter.createdAt = { $gte: fromDate, $lte: toDate };
    }

    if (singleItems) {
      queryFilter.lineItems = { $size: 1 };
    }

    if (search) {
      queryFilter.$or = [
        {
          externalId: search.trim(),
        },
        // {
        //   _id: new Types.ObjectId(search),
        // },
      ];
    }

    const [orders, total] = await this.orderRepository.findAllAndCount(
      {
        ...queryFilter,
      },
      {
        paging: {
          skip,
          limit,
        },
        sort: {
          createdAt: OrderDirection.DESC,
        },
      },
    );

    const orderIds = orders.map((order) => order._id);
    const pipelines = [
      {
        $match: {
          order: {
            $in: orderIds,
          },
        },
        // $sort: {
        //   createdAt: OrderDirection.DESC,
        // },
        // $skip: skip,
        // $limit: limit,
      },
      {
        $lookup: {
          from: 'artworks',
          localField: 'frontArtwork',
          foreignField: '_id',
          as: 'frontArtwork',
        },
      },
      {
        $unwind: {
          path: '$frontArtwork',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'frontArtwork.file',
          foreignField: '_id',
          as: 'frontArtworkFile',
        },
      },
      {
        $unwind: {
          path: '$frontArtworkFile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'artworks',
          localField: 'backArtwork',
          foreignField: '_id',
          as: 'backArtwork',
        },
      },
      {
        $unwind: {
          path: '$backArtwork',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'backArtwork.file',
          foreignField: '_id',
          as: 'backArtworkFile',
        },
      },
      {
        $unwind: {
          path: '$backArtworkFile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'mockups',
          localField: 'mockup1',
          foreignField: '_id',
          as: 'mockup1',
        },
      },
      {
        $unwind: {
          path: '$mockup1',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'mockup1.file',
          foreignField: '_id',
          as: 'mockup1File',
        },
      },
      {
        $unwind: {
          path: '$mockup1File',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'mockups',
          localField: 'mockup2',
          foreignField: '_id',
          as: 'mockup2',
        },
      },
      {
        $unwind: {
          path: '$mockup2',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'mockup2.file',
          foreignField: '_id',
          as: 'mockup2File',
        },
      },
      {
        $unwind: {
          path: '$mockup2File',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          order: 1,
          product: 1,
          variant: 1,
          barcode: 1,
          quantity: 1,
          status: 1,
          sellerNote: 1,
          systemNote: 1,
          subTotal: 1,
          total: 1,
          reason: 1,
          productTitle: 1,
          productCode: 1,
          variantCode: 1,
          variantSize: 1,
          variantColor: 1,
          variantStyle: 1,
          createdAt: 1,
          updatedAt: 1,
          'frontArtworkFile.key': 1,
          'frontArtworkFile.folder': 1,
          'backArtworkFile.key': 1,
          'backArtworkFile.folder': 1,
          'mockup1File.preview': 1,
          'mockup1File.previewFolder': 1,
          'mockup2File.preview': 1,
          'mockup2File.previewFolder': 1,
        },
      },
    ];

    const orderItems = await this.orderItemRepository.raw(pipelines);

    // for (const orderItem of orderItems) {
    //   const { frontArtworkFile, backArtworkFile, mockup1File, mockup2File } = orderItem;

    //   if (frontArtworkFile) {
    //     orderItem.frontArtwork = `${this.configService.cdn.url}/${frontArtworkFile.folder}/${frontArtworkFile.key}`;
    //     delete orderItem.frontArtworkFile;
    //   }

    //   if (backArtworkFile) {
    //     orderItem.backArtwork = `${this.configService.cdn.url}/${backArtworkFile.folder}/${backArtworkFile.key}`;
    //     delete orderItem.backArtworkFile;
    //   }

    //   if (mockup1File) {
    //     orderItem.mockup1 = `${this.configService.cdn.url}/${mockup1File.previewFolder}/${mockup1File.preview}`;
    //     delete orderItem.mockup1File;
    //   }

    //   if (mockup2File) {
    //     orderItem.mockup2 = `${this.configService.cdn.url}/${mockup2File.previewFolder}/${mockup2File.preview}`;
    //     delete orderItem.mockup2File;
    //   }
    // }

    const mappedOrders = orders.map((order) => {
      // @ts-ignore
      order.lineItems = order.lineItems.map((orderItem) =>
        // @ts-ignore
        orderItems.find((item: OrderItemEntity) => item._id.toString() === orderItem._id.toString()),
      );

      return order;
    });

    return new PageDto(mappedOrders, total);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getOrdersByProductId(getOrdersDto: GetOrdersDto, user: UserEntity): Promise<PageDto> {
    const { limit, skip, status, from, to, singleItems, storeCode, productId, sort, order } = getOrdersDto;

    const queryFilter: FilterQuery<OrderEntity> = {};

    if (user.role?.name !== RoleType.Admin) {
      queryFilter.user = user._id;
    }

    if (status) {
      queryFilter.status = status;
    }

    if (from && to) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      queryFilter.createdAt = { $gte: fromDate, $lte: toDate };
    }

    if (singleItems) {
      queryFilter.lineItems = { $size: 1 };
    }

    // if (storeCode) {
    //   const store = await this.storeRepository.findOne({ code: storeCode });

    //   if (!store) {
    //     throw new NotFoundException('Store not found');
    //   }

    //   queryFilter.store = store._id;
    // }

    const countPipeline = [
      {
        $match: {
          ...queryFilter,
        },
      },
      {
        $lookup: {
          from: 'orderItems',
          localField: 'lineItems',
          foreignField: '_id',
          as: 'lineItems',
        },
      },
      {
        $match: {
          'lineItems.product': new Types.ObjectId(productId),
        },
      },
      //  Cuz after unwind the linesItems, the orders are duplicated if they have more than 1 lineItem
      {
        $group: {
          _id: '$_id',
          lineItems: { $push: '$lineItems' },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ];

    const result = await this.orderRepository.raw(countPipeline);

    const totalOrders = result[0].totalOrders;

    const mainPipeline = [
      {
        $match: {
          ...queryFilter,
        },
      },
      {
        $sort: {
          [sort]: order === OrderDirection.ASC ? 1 : -1,
        },
      },
      {
        $lookup: {
          from: 'orderItems',
          localField: 'lineItems',
          foreignField: '_id',
          as: 'lineItems',
        },
      },
      {
        $unwind: '$lineItems',
      },

      {
        $match: {
          'lineItems.product': new Types.ObjectId(productId),
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      // Front artwork
      {
        $lookup: {
          from: 'artworks',
          localField: 'lineItems.frontArtwork',
          foreignField: '_id',
          as: 'lineItems.frontArtwork',
        },
      },
      {
        $unwind: { path: '$lineItems.frontArtwork', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'files',
          let: { fileId: '$lineItems.frontArtwork.file' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$fileId'] } } },
            { $project: { preview: 1, previewFolder: 1 } },
          ],
          as: 'lineItems.frontArtworkFile',
        },
      },
      {
        $unwind: { path: '$lineItems.frontArtworkFile', preserveNullAndEmptyArrays: true },
      },
      // Back artwork
      {
        $lookup: {
          from: 'artworks',
          localField: 'lineItems.backArtwork',
          foreignField: '_id',
          as: 'lineItems.backArtwork',
        },
      },
      {
        $unwind: { path: '$lineItems.backArtwork', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'files',
          let: { fileId: '$lineItems.backArtwork.file' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$fileId'] } } },
            { $project: { preview: 1, previewFolder: 1 } },
          ],
          as: 'lineItems.backArtworkFile',
        },
      },
      {
        $unwind: { path: '$lineItems.backArtworkFile', preserveNullAndEmptyArrays: true },
      },
      // Mockup1
      {
        $lookup: {
          from: 'artworks',
          localField: 'lineItems.mockup1',
          foreignField: '_id',
          as: 'lineItems.mockup1',
        },
      },
      {
        $unwind: { path: '$lineItems.mockup1', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'files',
          let: { fileId: '$lineItems.mockup1.file' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$fileId'] } } },
            { $project: { preview: 1, previewFolder: 1 } },
          ],
          as: 'lineItems.mockup1File',
        },
      },
      {
        $unwind: { path: '$lineItems.mockup1File', preserveNullAndEmptyArrays: true },
      },
      // Mockup2
      {
        $lookup: {
          from: 'artworks',
          localField: 'lineItems.mockup2',
          foreignField: '_id',
          as: 'lineItems.mockup2',
        },
      },
      {
        $unwind: { path: '$lineItems.mockup2', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'files',
          let: { fileId: '$lineItems.mockup2.file' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$fileId'] } } },
            { $project: { preview: 1, previewFolder: 1 } },
          ],
          as: 'lineItems.mockup2File',
        },
      },
      {
        $unwind: { path: '$lineItems.mockup2File', preserveNullAndEmptyArrays: true },
      },
      // Group lineItems after unwind
      {
        $group: {
          _id: '$_id',
          doc: {
            $first: '$$ROOT',
          },
          lineItems: { $push: '$lineItems' },
        },
      },
      // {
      //   $replaceRoot: {
      //     newRoot: '$doc',
      //   },
      // },
      // {
      //   $project: {
      //     user: 0,
      //   },
      // },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
    const unmappedOrders = (await this.orderRepository.raw(mainPipeline)) as any[];

    const orders = unmappedOrders.map((myOrder) => ({ ...myOrder.doc, lineItems: myOrder.lineItems }));

    const flattenedLineItems = orders.flatMap((myOrder) => myOrder.lineItems);

    for (const orderItem of flattenedLineItems) {
      const { frontArtworkFile, backArtworkFile, mockup1File, mockup2File } = orderItem;

      if (frontArtworkFile) {
        orderItem.frontArtwork = `${this.configService.cdn.url}/${frontArtworkFile.previewFolder}/${frontArtworkFile.preview}`;
        delete orderItem.frontArtworkFile;
      }

      if (backArtworkFile) {
        orderItem.backArtwork = `${this.configService.cdn.url}/${backArtworkFile.previewFolder}/${backArtworkFile.preview}`;
        delete orderItem.backArtworkFile;
      }

      if (mockup1File) {
        orderItem.mockup1 = `${this.configService.cdn.url}/${mockup1File.previewFolder}/${mockup1File.preview}`;
        delete orderItem.mockup1File;
      }

      if (mockup2File) {
        orderItem.mockup2 = `${this.configService.cdn.url}/${mockup2File.previewFolder}/${mockup2File.preview}`;
        delete orderItem.mockup2File;
      }
    }

    return new PageDto(orders, totalOrders as number);
  }

  async getOrderDetailByBarcode(barcode: string): Promise<IGetOrderDetailByBarcodeResponse> {
    const options = {
      populate: [
        {
          path: 'lineItems',
          populate: [
            {
              path: 'frontArtwork',
            },
            {
              path: 'backArtwork',
            },
            {
              path: 'mockup1',
            },
            {
              path: 'mockup2',
            },
          ],
        },
      ],
    };

    if (barcode.startsWith('BO')) {
      const orderItem = await this.orderItemRepository.findOne({ barcode });

      if (!orderItem) {
        throw new BadRequestException('Barcode not found');
      }

      const order = await this.orderRepository.findOneById(orderItem.order as Types.ObjectId, options);

      if (!order) {
        throw new BadRequestException('Barcode not found');
      }

      const orderDetail: IGetOrderDetailByBarcodeResponse = order.toJSON();
      orderDetail.targetOrderItemId = orderItem._id;

      return orderDetail;
    }

    const order = await this.orderRepository.findOne({ name: barcode }, options);

    if (!order) {
      throw new BadRequestException('Barcode not found');
    }

    return order;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async createOrder(createOrderDto: CreateOrderDto, user: UserEntity): Promise<Omit<OrderEntity, 'user'>> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { orderItems, shipping, externalId, storeCode, note, defaultStatus, designerName } = createOrderDto;
      const { firstName, lastName, email, phone, country, state, address1, address2, city, zipCode } = shipping;
      const activeArtworkIds: Types.ObjectId[] = [];
      const activeMockupIds: Types.ObjectId[] = [];

      // const variantIdsSet = new Set<string>();

      // for (const item of orderItems) {
      //   if (variantIdsSet.has(item.variantId)) {
      //     throw new BadRequestException('Duplicated variantId');
      //   } else {
      //     variantIdsSet.add(item.variantId);
      //   }
      // }

      const productIds = orderItems.map((item) => new Types.ObjectId(item.productId));
      const products = await this.productRepository.findAll({
        _id: { $in: productIds },
      });

      const variantIds = orderItems.map((item) => new Types.ObjectId(item.variantId));
      const variants = await this.productVariantRepository.findAll({
        $or: [
          {
            _id: { $in: variantIds },
          },
          {
            code: { $in: variantIds },
          },
        ],
      });

      let totalPrice = 0;
      const counterOrderStore = await this.counterService.findAndUpdateCounter(`BO${storeCode}`, session);

      const orderName = `${storeCode}-${counterOrderStore?.seq}`;
      const newOrderId = new Types.ObjectId();
      let defaultOrderStatus = defaultStatus || OrderStatus.PENDING;
      let defaultOrderItemStatus = OrderItemStatus.PENDING;

      const newOrderItems = orderItems.map((item, index) => {
        // @ts-ignore
        const product = products.find((p) => p._id.toString() === item.productId);
        // @ts-ignore
        const variant = variants.find((v) => v._id.toString() === item.variantId);
        const newOrderIemId = new Types.ObjectId();

        if (item.frontArtwork) {
          activeArtworkIds.push(new Types.ObjectId(item.frontArtwork));
        } else {
          defaultOrderStatus = OrderStatus.NO_ARTWORK;
          defaultOrderItemStatus = OrderItemStatus.NO_ARTWORK;
        }

        if (item.backArtwork) {
          activeArtworkIds.push(new Types.ObjectId(item.backArtwork));
        }

        if (item.mockup1) {
          activeMockupIds.push(new Types.ObjectId(item.mockup1));
        }

        if (item.mockup2) {
          activeMockupIds.push(new Types.ObjectId(item.mockup2));
        }

        totalPrice += variant?.price || 0;

        return {
          _id: newOrderIemId,
          order: newOrderId,
          product: product?._id,
          variant: variant?._id,
          barcode: `${'BO'}${orderName}-${index + 1}`,
          quantity: item.quantity,
          status: defaultOrderItemStatus,
          frontArtwork: item.frontArtwork ? new Types.ObjectId(item.frontArtwork) : undefined,
          backArtwork: item.backArtwork ? new Types.ObjectId(item.backArtwork) : undefined,
          mockup1: item.mockup1 ? new Types.ObjectId(item.mockup1) : undefined,
          mockup2: item.mockup2 ? new Types.ObjectId(item.mockup2) : undefined,
          subTotal: variant?.price,
          total: variant?.price,
          sellerNote: item.note,
          productTitle: product?.title || '',
          productCode: product?.productCode || '',
          variantCode: variant?.code || '',
          variantSize: variant?.size || '',
          variantColor: variant?.color || '',
          variantStyle: variant?.style || '',
        };
      });

      const createOrderItem = await this.orderItemRepository.createMany(newOrderItems, { session });

      const createdOrder = await this.orderRepository.create(
        {
          _id: newOrderId,
          externalId,
          shippingAddress: {
            firstName,
            lastName,
            email,
            phone,
            addressLine1: address1,
            addressLine2: address2,
            city,
            zip: zipCode,
            region: state,
            country,
          },
          // store: store._id,
          name: orderName,
          shippingMethod: ShippingMethod.STANDARD,
          type: createOrderDto.type || OrderType.MANUAL,
          // @ts-ignore
          user: user._id,
          status: defaultOrderStatus,
          priority: 0,
          shippingEvents: [],
          shippingStatus: ShippingStatus.PENDING,
          tracking: {},
          logs: [
            {
              date: new Date(),
              status: defaultOrderStatus,
              updatedBy: user._id,
            },
          ],
          sellerNote: note,
          // @ts-ignore
          lineItems: createOrderItem,
          isPaid: false,
          total: totalPrice,
          subTotal: totalPrice,
          designerName,
        },
        { session },
      );

      // await this.artworkRepository.updateMany(
      //   { _id: { $in: activeArtworkIds } },
      //   { status: Status.Active },
      //   { session },
      // );
      // await this.artworkRepository.updateMany(
      //   { _id: { $in: activeMockupIds } },
      //   { status: Status.Active },
      //   { session },
      // );
      await session.commitTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      const { user: createdOrderUser, ...createdOrderData } = createdOrder.toJSON();

      return createdOrderData;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getOrderDetail(id: string, user: UserEntity): Promise<OrderEntity> {
    const select: Record<string, number> = {
      _id: 1,
      createdAt: 1,
      externalId: 1,
      lineItems: 1,
      name: 1,
      priority: 1,
      shippingAddress: 1,
      shippingEvents: 1,
      shippingMethod: 1,
      shippingStatus: 1,
      status: 1,
      store: 1,
      tracking: 1,
      type: 1,
      sellerNote: 1,
      systemNote: 1,
      subTotal: 1,
      total: 1,
      logs: 1,
      updatedAt: 1,
      user: 1,
    };

    const order = await this.orderRepository.findOneById(id, {
      populate: {
        path: 'lineItems',
        populate: [
          {
            path: 'frontArtwork',
            populate: {
              path: 'file',
              select: ['preview', 'previewFolder'],
            },
          },
          {
            path: 'backArtwork',
            populate: {
              path: 'file',
              select: ['preview', 'previewFolder'],
            },
          },
          {
            path: 'mockup1',
            populate: {
              path: 'file',
              select: ['preview', 'previewFolder'],
            },
          },
          {
            path: 'mockup2',
            populate: {
              path: 'file',
              select: ['preview', 'previewFolder'],
            },
          },
          {
            path: 'externalFileLinks',
          },
        ],
      },
      select,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // for (const item of order.lineItems) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   item.frontArtwork = item.frontArtwork
    //     ? {
    //         _id: (item.frontArtwork as ArtworkEntity)._id,
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         preview: `${this.configService.cdn.url}/${(item.frontArtwork as ArtworkEntity).file.previewFolder}/${
    //           (item.frontArtwork as ArtworkEntity).file.preview
    //         }`,
    //       }
    //     : undefined;

    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   item.backArtwork = item.backArtwork
    //     ? {
    //         _id: (item.backArtwork as ArtworkEntity)._id,
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         preview: `${this.configService.cdn.url}/${(item.backArtwork as ArtworkEntity).file.previewFolder}/${
    //           (item.backArtwork as ArtworkEntity).file.preview
    //         }`,
    //       }
    //     : undefined;

    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   item.mockup1 = item.mockup1
    //     ? {
    //         _id: (item.mockup1 as MockupEntity)._id,
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         preview: `${this.configService.cdn.url}/${(item.mockup1 as MockupEntity).file.previewFolder}/${
    //           (item.mockup1 as MockupEntity).file.preview
    //         }`,
    //       }
    //     : undefined;

    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   item.mockup2 = item.mockup2
    //     ? {
    //         _id: (item.mockup2 as MockupEntity)._id,
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         preview: `${this.configService.cdn.url}/${(item.mockup2 as MockupEntity).file.previewFolder}/${
    //           (item.mockup2 as MockupEntity).file.preview
    //         }`,
    //       }
    //     : undefined;
    // }

    const fullLogs = order.logs;
    order.logs = fullLogs.filter((log) => log.statusChanged === true);

    if (user.role?.name !== RoleType.Admin) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      order.fullLogs = fullLogs;
    }

    return order;
  }

  // async importOrders(importOrdersDto: ImportOrdersDto, user: UserEntity): Promise<Array<Omit<OrderEntity, 'user'>>> {
  //   const { orders } = importOrdersDto;

  //   // const variantIdsSet = new Set<string>();

  //   // for (const item of orders) {
  //   //   if (variantIdsSet.has(item.variantId)) {
  //   //     throw new BadRequestException('Duplicated variantId');
  //   //   } else {
  //   //     variantIdsSet.add(item.variantId);
  //   //   }
  //   // }

  //   for (const order of orders) {
  //     order.variantId = order.variantId.split('|')[0];
  //   }

  //   const result = OrdersImportZod.safeParse(orders);

  //   if (!result.success) {
  //     // eslint-disable-next-line no-console
  //     console.log('Invalid import data:', result.error);

  //     throw new BadRequestException('Invalid import data');
  //   }

  //   const formattedOrders = await this.formatOrders(orders);

  //   return await Promise.all(formattedOrders.map((order) => this.createOrder(order, user)));
  // }

  // // FIXME: Refactor this function
  // // eslint-disable-next-line sonarjs/cognitive-complexity
  // async formatOrders(importOrderItems: ImportOrderItemDto[]): Promise<CreateOrderDto[]> {
  //   const formattedOrders: CreateOrderDto[] = [];
  //   const variantCodes = importOrderItems.map((item) => item.variantId);
  //   const variants = await this.productVariantRepository.findAll(
  //     { code: { $in: variantCodes } },
  //     {
  //       select: ['_id', 'code'],
  //     },
  //   );

  //   const variantIds = variants.map((item) => item._id);
  //   const products = await this.productRepository.findAll({
  //     variants: { $in: variantIds },
  //   });

  //   console.log(products, variantCodes, variants, variantIds);

  //   for (const order of importOrderItems) {
  //     const variantId = variants.find((variant) => variant.code === order.variantId)?._id;
  //     const product = products.find((p) =>
  //       p.variants.find((variant) => variant._id.toString() === variantId?.toString()),
  //     );

  //     if (!product || !variantId) {
  //       throw new BadRequestException('Variant not found');
  //     }

  //     if (Number.isNaN(Number(order.quantity))) {
  //       throw new BadRequestException('Quantity invalid');
  //     }

  //     let frontArtwork;
  //     let backArtwork;
  //     let mockup1;
  //     let mockup2;

  //     // eslint-disable-next-line no-await-in-loop
  //     if (order.frontArtworkUrl) {
  //       // eslint-disable-next-line no-await-in-loop
  //       frontArtwork = await this.downloadAndUploadImage(order.frontArtworkUrl, ImageType.ARTWORK);
  //     }

  //     if (order.backArtworkUrl) {
  //       // eslint-disable-next-line no-await-in-loop
  //       backArtwork = await this.downloadAndUploadImage(order.backArtworkUrl, ImageType.ARTWORK);
  //     }

  //     if (order.mockUpUrl1) {
  //       // eslint-disable-next-line no-await-in-loop
  //       mockup1 = await this.downloadAndUploadImage(order.mockUpUrl1, ImageType.MOCKUP);
  //     }

  //     if (order.mockUpUrl2) {
  //       // eslint-disable-next-line no-await-in-loop
  //       mockup2 = await this.downloadAndUploadImage(order.mockUpUrl2, ImageType.MOCKUP);
  //     }

  //     const existedFormattedOrders = formattedOrders.find((o) => o.externalId === order.externalId);

  //     if (existedFormattedOrders) {
  //       existedFormattedOrders.orderItems.push({
  //         productId: product._id.toString(),
  //         variantId: variantId.toString(),
  //         quantity: Number(order.quantity),
  //         frontArtwork: frontArtwork ? frontArtwork._id : '',
  //         backArtwork: backArtwork ? backArtwork._id : '',
  //         mockup1: mockup1 ? mockup1._id : '',
  //         mockup2: mockup2 ? mockup2._id : '',
  //         note: '',
  //       });
  //     }

  //     if (!existedFormattedOrders) {
  //       formattedOrders.push({
  //         storeCode: order.storeCode,
  //         type: OrderType.IMPORT,
  //         externalId: order.externalId,
  //         designerName: order.designerName,
  //         shipping: {
  //           address1: order.addressLine1,
  //           address2: order.addressLine2 || '',
  //           city: order.city,
  //           country: order.country,
  //           email: order.email || '',
  //           firstName: order.firstName,
  //           lastName: order.lastName,
  //           phone: order.phone || '',
  //           state: order.region,
  //           zipCode: order.zip,
  //         },
  //         orderItems: [
  //           {
  //             productId: product._id.toString(),
  //             variantId: variantId.toString(),
  //             quantity: Number(order.quantity),
  //             frontArtwork: frontArtwork ? frontArtwork._id : '',
  //             backArtwork: backArtwork ? backArtwork._id : '',
  //             mockup1: mockup1 ? mockup1._id : '',
  //             mockup2: mockup2 ? mockup2._id : '',
  //             note: '',
  //           },
  //         ],
  //       });
  //     }
  //   }

  //   return formattedOrders;
  // }

  async updateArtworkError(updateArtworkError: UpdateArtworkError): Promise<boolean> {
    const { orderItemId, orderId } = updateArtworkError;
    const orderItem = await this.orderItemRepository.findOneById(orderItemId);
    const order = await this.orderRepository.findOneById(orderId);

    if (!orderItem) {
      throw new BadRequestException('Order Item not found');
    }

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    await this.orderItemRepository.updateOne(
      { _id: new Types.ObjectId(orderItemId) },
      { status: OrderItemStatus.ARTWORK_ERROR },
    );
    await this.orderRepository.updateOne(
      { _id: new Types.ObjectId(orderId) },
      {
        status: OrderStatus.ARTWORK_ERROR,
        $push: { logs: { date: new Date(), status: OrderStatus.ARTWORK_ERROR, statusChanged: true } },
      },
    );

    // const { frontArtwork, backArtwork } = orderItem;
    // const inactiveFileIds: Types.ObjectId[] = [frontArtwork as Types.ObjectId];

    // if (backArtwork) {
    //   inactiveFileIds.push(backArtwork as Types.ObjectId);
    // }

    // await this.artworkRepository.updateMany({ _id: { $in: inactiveFileIds } }, { status: Status.INACTIVE });

    return true;
  }

  async syncToFactory(syncOrderToFactoryDto: SyncOrderToFactoryDto): Promise<unknown> {
    const { lastOrderUpdatedAt, lastOrderItemUpdatedAt } = syncOrderToFactoryDto;

    const pipelines = [
      {
        $match: {
          updatedAt: {
            $gt: lastOrderItemUpdatedAt,
          },
          isPaid: true,
        },
      },
      {
        $lookup: {
          from: 'artworks',
          localField: 'frontArtwork',
          foreignField: '_id',
          as: 'frontArtwork',
        },
      },
      {
        $unwind: {
          path: '$frontArtwork',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'frontArtwork.file',
          foreignField: '_id',
          as: 'frontArtworkFile',
        },
      },
      {
        $unwind: {
          path: '$frontArtworkFile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'artworks',
          localField: 'backArtwork',
          foreignField: '_id',
          as: 'backArtwork',
        },
      },
      {
        $unwind: {
          path: '$backArtwork',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'backArtwork.file',
          foreignField: '_id',
          as: 'backArtworkFile',
        },
      },
      {
        $unwind: {
          path: '$backArtworkFile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'mockups',
          localField: 'mockup1',
          foreignField: '_id',
          as: 'mockup1',
        },
      },
      {
        $unwind: {
          path: '$mockup1',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'mockup1.file',
          foreignField: '_id',
          as: 'mockup1File',
        },
      },
      {
        $unwind: {
          path: '$mockup1File',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'mockups',
          localField: 'mockup2',
          foreignField: '_id',
          as: 'mockup2',
        },
      },
      {
        $unwind: {
          path: '$mockup2',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'mockup2.file',
          foreignField: '_id',
          as: 'mockup2File',
        },
      },
      {
        $unwind: {
          path: '$mockup2File',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          order: 1,
          product: 1,
          variant: 1,
          barcode: 1,
          quantity: 1,
          status: 1,
          sellerNote: 1,
          systemNote: 1,
          total: 1,
          subTotal: 1,
          reason: 1,
          productTitle: 1,
          productCode: 1,
          variantCode: 1,
          variantSize: 1,
          variantColor: 1,
          variantStyle: 1,
          designerName: 1,
          createdAt: 1,
          updatedAt: 1,
          'frontArtworkFile.key': 1,
          'frontArtworkFile.folder': 1,
          'backArtworkFile.key': 1,
          'backArtworkFile.folder': 1,
          'mockup1File.preview': 1,
          'mockup1File.previewFolder': 1,
          'mockup2File.preview': 1,
          'mockup2File.previewFolder': 1,
        },
      },
    ];

    const orders = await this.orderRepository.findAll({ updatedAt: { $gte: lastOrderUpdatedAt }, isPaid: true });
    const orderItems = await this.orderItemRepository.raw(pipelines);

    // for (const orderItem of orderItems) {
    //   const { frontArtworkFile, backArtworkFile, mockup1File, mockup2File } = orderItem;

    //   if (frontArtworkFile) {
    //     orderItem.frontArtwork = `${this.configService.cdn.url}/${frontArtworkFile.folder}/${frontArtworkFile.key}`;
    //     delete orderItem.frontArtworkFile;
    //   }

    //   if (backArtworkFile) {
    //     orderItem.backArtwork = `${this.configService.cdn.url}/${backArtworkFile.folder}/${backArtworkFile.key}`;
    //     delete orderItem.backArtworkFile;
    //   }

    //   if (mockup1File) {
    //     orderItem.mockup1 = `${this.configService.cdn.url}/${mockup1File.previewFolder}/${mockup1File.preview}`;
    //     delete orderItem.mockup1File;
    //   }

    //   if (mockup2File) {
    //     orderItem.mockup2 = `${this.configService.cdn.url}/${mockup2File.previewFolder}/${mockup2File.preview}`;
    //     delete orderItem.mockup2File;
    //   }
    // }

    return {
      orders,
      orderItems,
    };
  }

  async actionPayment(id: string | Types.ObjectId, user: UserEntity): Promise<OrderEntity | null> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }

    const filterQuery: FilterQuery<OrderEntity> = {
      _id: id,
    };

    if (user.role?.name !== RoleType.Admin) {
      filterQuery.user = user._id;
    }

    const existedOrder = await this.orderRepository.findOne(
      { ...filterQuery },
      {
        populate: {
          path: 'store',
        },
      },
    );

    if (!existedOrder) {
      throw new BadRequestException('Order not found');
    }

    if (existedOrder.isPaid) {
      throw new BadRequestException('Order is already paid');
    }

    // const actionPaymentOrderDto: ActionPaymentOrderDto = {
    //   amount: existedOrder.total,
    //   orderIds: [`${existedOrder._id}`],
    //   storeId: `${existedOrder.store._id}`,
    // };

    // await this.transactionService.actionPaymentOrder(user, actionPaymentOrderDto);
    await this.orderItemRepository.updateMany(
      { order: existedOrder._id },
      {
        isPaid: true,
        status: OrderItemStatus.PROCESSING,
      },
    );

    return await this.orderRepository.findOneByIdAndUpdate(id, {
      isPaid: true,
      status: OrderStatus.PROCESSING,
      $push: { logs: { status: OrderItemStatus.PROCESSING, user: user._id, date: new Date(), statusChanged: true } },
    });
  }

  async calculateBulkPayment(payOrdersDto: PayOrdersDto, user: UserEntity): Promise<unknown> {
    const orderIds = payOrdersDto.orderIds.map((id) => new Types.ObjectId(id));

    const filterQuery: FilterQuery<OrderEntity> = {
      _id: { $in: orderIds },
    };

    if (user.role?.name !== RoleType.Admin) {
      filterQuery.user = user._id;
    }

    const orders = await this.orderRepository.findAll(
      {
        ...filterQuery,
      },
      {
        populate: {
          path: 'lineItems',
          populate: {
            path: 'frontArtwork',
            populate: {
              path: 'file',
              select: ['preview', 'previewFolder'],
            },
          },
        },
      },
    );

    // orders.map((order) => {
    //   order.lineItems.map((lineItem) => {
    //     const frontArtwork = lineItem.frontArtwork;
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     lineItem.frontArtwork = `${this.configService.cdn.url}/${frontArtwork?.file.previewFolder}/${frontArtwork?.file.preview}`;
    //   });
    // });

    const totalAmount = orders.reduce((total, order) => total + order.total, 0);

    return {
      total: totalAmount,
      orders,
    };
  }

  async payOrders(payOrdersDto: PayOrdersDto, user: UserEntity): Promise<unknown> {
    const orderIds = payOrdersDto.orderIds.map((id) => new Types.ObjectId(id));

    const filterQuery: FilterQuery<OrderEntity> = {
      _id: { $in: orderIds },
    };

    if (user.role?.name !== RoleType.Admin) {
      filterQuery.user = user._id;
    }

    const orders = await this.orderRepository.findAll(filterQuery);

    const totalPrice = orders.reduce((total, order) => total + order.total, 0);

    if (totalPrice > user.balance) {
      throw new BadRequestException('Not enough balance');
    }

    const paidOrders = await Promise.all(orderIds.map((orderId) => this.actionPayment(orderId, user)));

    const succeedOrders = paidOrders.filter((order) => order?.isPaid === true);
    const failedOrders = paidOrders.filter((order) => order?.isPaid === false);

    return {
      success: succeedOrders.length,
      failed: failedOrders.length,
      succeedOrders,
      failedOrders,
    };
  }

  async updateStatus(id: string, status: string, user: UserEntity): Promise<OrderEntity | null> {
    const order = await this.orderRepository.findOneById(id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status === OrderStatus.DONE) {
      throw new BadRequestException('Order is already done');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    return await this.orderRepository.findOneByIdAndUpdate(id, {
      status,
      $push: { logs: { status, user: user._id, createdAt: new Date(), statusChanged: true } },
    });
  }

  async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<OrderEntity | null> {
    const { note } = updateNoteDto;
    const order = await this.orderRepository.findOneById(id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return await this.orderRepository.findOneByIdAndUpdate(id, { sellerNote: note });
  }

  async updateSystemNote(id: string, updateNoteDto: UpdateNoteDto): Promise<OrderEntity | null> {
    const { note } = updateNoteDto;
    const order = await this.orderRepository.findOneById(id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return await this.orderRepository.findOneByIdAndUpdate(id, { systemNote: note });
  }

  async updateOrderFromFactory(updateOrderFromFactoryDto: UpdateOrderFromFactoryDto): Promise<OrderEntity | null> {
    try {
      const newLogEntry = {
        date: new Date(),
        status: OrderStatus.DELIVERED,
        statusChanged: true,
      };

      return await this.orderRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(updateOrderFromFactoryDto.id) },
        { status: OrderStatus.DELIVERED, $push: { logs: newLogEntry } },
      );
    } catch {
      throw new BadRequestException('Update status failed');
    }
  }
}
