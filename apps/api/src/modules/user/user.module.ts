import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CounterEntity, CounterSchema } from '@/modules/counter/counter.entity';
import { CounterModule } from '@/modules/counter/counter.module';
import { PermissionEntity, PermissionSchema } from '@/modules/permission/permission.entity';
import { RoleEntity, RoleSchema } from '@/modules/role/role.entity';

import { RoleRepository } from '../role/role.repository';
import { UserController } from './user.controller';
import { UserEntity, UserSchema } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    CounterModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: CounterEntity.name, schema: CounterSchema }]),
    MongooseModule.forFeature([
      {
        name: RoleEntity.name,
        schema: RoleSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: PermissionEntity.name,
        schema: PermissionSchema,
      },
    ]),
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserRepository, RoleRepository],
})
export class UserModule {}
