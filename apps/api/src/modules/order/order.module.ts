import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { CounterEntity, CounterSchema } from '@/modules/counter/counter.entity';
import { CounterRepository } from '@/modules/counter/counter.repository';
import { CounterService } from '@/modules/counter/counter.service';
import { OrderItemEntity, OrderItemSchema } from '@/modules/order-item/order-item.entity';
import { OrderItemRepository } from '@/modules/order-item/order-item.repository';
import { ProductEntity, ProductSchema } from '@/modules/product/product.entity';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductVariantEntity, ProductVariantsSchema } from '@/modules/product-variant/product-variant.entity';
import { ProductVariantRepository } from '@/modules/product-variant/product-variant.repository';
// import { UploadModule } from '@/modules/upload/upload.module';
import { UserEntity, UserSchema } from '@/modules/user/user.entity';

import { UserRepository } from '../user/user.repository';
import { ImportEntity, ImportSchema } from './import.entity';
import { OrderController } from './order.controller';
import { OrderEntity, OrderSchema } from './order.entity';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [
    // UploadModule,
    MongooseModule.forFeature([
      {
        name: OrderEntity.name,
        schema: OrderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: OrderItemEntity.name,
        schema: OrderItemSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ImportEntity.name,
        schema: ImportSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProductEntity.name,
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProductVariantEntity.name,
        schema: ProductVariantsSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    CounterService,
    CounterRepository,
    OrderRepository,
    OrderItemRepository,
    ProductRepository,
    ProductVariantRepository,
    UserRepository,
  ],
  exports: [OrderService],
})
export class OrderModule {}
