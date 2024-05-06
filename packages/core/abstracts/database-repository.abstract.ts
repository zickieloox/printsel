import {
  ClientSession,
  Model,
  Document,
  PipelineStage,
  PopulateOptions,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  FilterQuery,
  IfAny,
  MergeType,
  Require_id,
} from 'mongoose';
import { DATABASE_DELETED_AT_FIELD_NAME } from '@core/constants';
import {
  IDatabaseCreateOptions,
  IDatabaseExistOptions,
  IDatabaseFindAllOptions,
  IDatabaseFindOneOptions,
  IDatabaseGetTotalOptions,
  IDatabaseCreateManyOptions,
  IDatabaseManyOptions,
  IDatabaseSoftDeleteManyOptions,
  IDatabaseRestoreManyOptions,
  IDatabaseRawOptions,
  IDatabaseFindOneLockOptions,
  IDatabaseRawFindAllOptions,
  IDatabaseRawGetTotalOptions,
} from '@core/interfaces/IDatabaseRepository';
import { OrderDirection } from '@core/constants';
import { DatabaseEntityAbstract } from './entity.abstract';

export abstract class DatabaseRepositoryAbstract<Entity extends DatabaseEntityAbstract, EntityDocument> {
  protected _repository: Model<Entity>;
  protected _joinOnFind?: PopulateOptions | PopulateOptions[];

  constructor(repository: Model<Entity>, options?: PopulateOptions | PopulateOptions[]) {
    // super();

    this._repository = repository;
    this._joinOnFind = options;
  }

  async findAll<T = EntityDocument>(
    find?: FilterQuery<Entity>,
    options?: IDatabaseFindAllOptions<ClientSession>,
  ): Promise<T[]> {
    const findAll = this._repository.find<T>(find ? find : {});

    if (!options?.withDeleted) {
      findAll.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findAll.select(options.select);
    }

    if (options?.paging) {
      findAll.limit(options.paging.limit).skip(options.paging.skip);
    }

    if (options?.sort) {
      findAll.sort(options.sort);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findAll.populate(this._joinOnFind);
      } else {
        findAll.populate(options.populate);
      }
    }

    if (options?.session) {
      findAll.session(options.session);
    }

    const data = options?.lean === false ? await findAll.exec() : await findAll.lean().exec();

    return data as T[];
  }

  async findAllAndCount<T = EntityDocument>(
    find?: FilterQuery<Entity>,
    options?: IDatabaseFindAllOptions<ClientSession>,
  ): Promise<{ data: T[]; total: number }> {
    const findAll = this._repository.find<T>(find ? find : {});

    const total = await this.getTotal(find, options);

    if (!options?.withDeleted) {
      findAll.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findAll.select(options.select);
    }

    if (options?.paging) {
      findAll.limit(options.paging.limit).skip(options.paging.skip);
    }

    if (options?.sort) {
      findAll.sort(options.sort);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the join option');
        }
        findAll.populate(this._joinOnFind);
      } else {
        findAll.populate(options.populate);
      }
    }

    if (options?.session) {
      findAll.session(options.session);
    }

    const data = options?.lean === false ? await findAll.exec() : await findAll.lean().exec();

    return { data: data as T[], total };
  }

  async findAllDistinct<T = EntityDocument>(
    fieldDistinct: string,
    find?: Record<string, any>,
    options?: IDatabaseFindAllOptions<ClientSession>,
  ): Promise<T[]> {
    const findAll = this._repository.distinct<T>(fieldDistinct, find);

    if (!options?.withDeleted) {
      findAll.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findAll.select(options.select);
    }

    if (options?.paging) {
      findAll.limit(options.paging.limit).skip(options.paging.skip);
    }

    if (options?.sort) {
      findAll.sort(options.sort);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findAll.populate(this._joinOnFind);
      } else {
        findAll.populate(options.populate);
      }
    }

    if (options?.session) {
      findAll.session(options.session);
    }

    const data = options?.lean === false ? await findAll.exec() : await findAll.lean().exec();

    return data as T[];
  }

  async findOne<T = EntityDocument>(
    find: Record<string, any>,
    options?: IDatabaseFindOneOptions<ClientSession>,
  ): Promise<T | null> {
    const findOne = this._repository.findOne<T>(find);

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    const data = options?.lean === false ? await findOne.exec() : await findOne.lean().exec();

    return data as T;
  }

  async findOneById<T = EntityDocument>(
    _id: string,
    options?: IDatabaseFindOneOptions<ClientSession>,
  ): Promise<T | null> {
    const findOne = this._repository.findById<T>(_id);

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    const data = options?.lean === false ? await findOne.exec() : await findOne.lean().exec();

    return data as T;
  }

  async updateOne<T = EntityDocument>(find: FilterQuery<T>, update: UpdateQuery<Entity>): Promise<boolean> {
    const result = await this._repository.updateOne(find, update);

    return result.modifiedCount > 0;
  }

  async findOneAndUpdate<T = EntityDocument>(
    find: FilterQuery<T>,
    data: UpdateQuery<Entity>,
    options?: IDatabaseFindOneLockOptions<ClientSession>,
  ): Promise<EntityDocument | null> {
    const findOne = this._repository.findOneAndUpdate<EntityDocument>(find, data, {
      new: true,
    });

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    return findOne.exec();
  }

  async findOneByIdAndUpdate<T = EntityDocument>(
    _id: string,
    data: UpdateQuery<Entity>,
    options?: IDatabaseFindOneLockOptions<ClientSession>,
  ): Promise<T | null> {
    const findOne = this._repository.findOneAndUpdate<T>({ _id: _id }, data, {
      new: true,
    });

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    return findOne.exec();
  }

  async findOneAndLock<T = EntityDocument>(
    find: FilterQuery<T>,
    options?: IDatabaseFindOneLockOptions<ClientSession>,
  ): Promise<T | null> {
    const findOne = this._repository.findOneAndUpdate<T>(find, {
      new: true,
      useFindAndModify: false,
    });

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    return findOne.exec();
  }

  async findOneByIdAndLock<T = EntityDocument>(
    _id: string,
    options?: IDatabaseFindOneLockOptions<ClientSession>,
  ): Promise<T | null> {
    const findOne = this._repository.findByIdAndUpdate<T>(_id, {
      new: true,
      useFindAndModify: false,
    });

    if (!options?.withDeleted) {
      findOne.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.select) {
      findOne.select(options.select);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        findOne.populate(this._joinOnFind);
      } else {
        findOne.populate(options.populate);
      }
    }

    if (options?.session) {
      findOne.session(options.session);
    }

    if (options?.sort) {
      findOne.sort(options.sort);
    }

    return findOne.exec();
  }

  async getTotal(find?: Record<string, any>, options?: IDatabaseGetTotalOptions<ClientSession>): Promise<number> {
    const count = this._repository.countDocuments(find);

    if (!options?.withDeleted) {
      count.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.session) {
      count.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        count.populate(this._joinOnFind);
      } else {
        count.populate(options.populate);
      }
    }

    return count;
  }

  async exists(find: Record<string, any>, options?: IDatabaseExistOptions<ClientSession>): Promise<boolean> {
    if (options?.excludeId) {
      find = {
        ...find,
        _id: {
          $nin: options?.excludeId.map((val) => val) ?? [],
        },
      };
    }

    const exist = this._repository.exists(find);
    if (!options?.withDeleted) {
      exist.where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);
    }

    if (options?.session) {
      exist.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        exist.populate(this._joinOnFind);
      } else {
        exist.populate(options.populate);
      }
    }

    const result = await exist;
    return result ? true : false;
  }

  async create<Dto = Partial<Entity>>(
    data: Partial<Entity>,
    options?: IDatabaseCreateOptions<ClientSession>,
  ): Promise<EntityDocument> {
    const dataCreate = data;

    if (options?._id) {
      dataCreate._id = options?._id;
    }

    const created = await this._repository.create([dataCreate], {
      session: options ? options.session : undefined,
    });

    return created[0] as EntityDocument;
  }

  // async save(
  //   repository: EntityDocument & Document<Types.ObjectId>,
  //   options?: IDatabaseSaveOptions,
  // ): Promise<EntityDocument> {
  //   return repository.save(options);
  // }

  // async permanentlyDelete(
  //   repository: EntityDocument & Document<Types.ObjectId>,
  //   options?: IDatabaseSaveOptions,
  // ): Promise<EntityDocument> {
  //   return repository.deleteOne(options);
  // }

  async softDelete<T = EntityDocument>(
    find: FilterQuery<T>,
    options?: IDatabaseFindOneLockOptions<ClientSession>,
  ): Promise<boolean> {
    const findOne = this._repository.updateOne<EntityDocument>(
      find,
      {
        deletedAt: new Date(),
      },
      {
        new: true,
      },
    );

    if (options?.session) {
      findOne.session(options.session);
    }

    const result = await findOne.exec();

    if (result.matchedCount === 0) {
      throw new Error('Soft delete failed');
    }

    return true;
  }

  // async restore(
  //   repository: EntityDocument & Document<Types.ObjectId> & { deletedAt?: Date },
  //   options?: IDatabaseSaveOptions,
  // ): Promise<EntityDocument> {
  //   repository.deletedAt = undefined;
  //   return repository.save(options);
  // }

  // bulk
  async createMany<Dto = Partial<Entity>[]>(
    data: Partial<Entity>[],
    options?: IDatabaseCreateManyOptions<ClientSession>,
  ): Promise<
    Array<
      MergeType<
        IfAny<Entity, any, Document<unknown, {}, Entity> & Require_id<Entity>>,
        Omit<Array<Partial<Entity>>, '_id'>
      >
    >
  > {
    const create = this._repository.insertMany(data, {
      session: options ? options.session : undefined,
    });

    return await create;
  }

  // async permanentlyDeleteByIds(_id: string[], options?: IDatabaseManyOptions<ClientSession>): Promise<boolean> {
  //   const del = this._repository.deleteMany({
  //     _id: {
  //       $in: _id,
  //     },
  //   });

  //   if (options?.session) {
  //     del.session(options.session);
  //   }

  //   if (options?.populate) {
  //     if (typeof options.populate === 'boolean') {
  //       if (!this._joinOnFind) {
  //         throw new Error('You should provide the populate option');
  //       }
  //       del.populate(this._joinOnFind);
  //     } else {
  //       del.populate(options.populate);
  //     }
  //   }

  //   try {
  //     await del;
  //     return true;
  //   } catch (error: unknown) {
  //     throw error;
  //   }
  // }

  // async permanentlyDeleteMany(find: Record<string, any>, options?: IDatabaseManyOptions<ClientSession>): Promise<boolean> {
  //   const del = this._repository.deleteMany(find);

  //   if (options?.session) {
  //     del.session(options.session);
  //   }

  //   if (options?.populate) {
  //     if (typeof options.populate === 'boolean') {
  //       if (!this._joinOnFind) {
  //         throw new Error('You should provide the populate option');
  //       }
  //       del.populate(this._joinOnFind);
  //     } else {
  //       del.populate(options.populate);
  //     }
  //   }

  //   try {
  //     await del;
  //     return true;
  //   } catch (error: unknown) {
  //     throw error;
  //   }
  // }

  async softDeleteManyByIds(_id: string[], options?: IDatabaseSoftDeleteManyOptions<ClientSession>): Promise<boolean> {
    const softDel = this._repository
      .updateMany(
        {
          _id: {
            $in: _id,
          },
        },
        {
          $set: {
            deletedAt: new Date(),
          },
        },
      )
      .where(DATABASE_DELETED_AT_FIELD_NAME)
      .exists(false);

    if (options?.session) {
      softDel.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        softDel.populate(this._joinOnFind);
      } else {
        softDel.populate(options.populate);
      }
    }

    try {
      await softDel;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  async softDeleteMany(
    find: Record<string, any>,
    options?: IDatabaseSoftDeleteManyOptions<ClientSession>,
  ): Promise<boolean> {
    const softDel = this._repository
      .updateMany(find, {
        $set: {
          deletedAt: new Date(),
        },
      })
      .where(DATABASE_DELETED_AT_FIELD_NAME)
      .exists(false);

    if (options?.session) {
      softDel.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        softDel.populate(this._joinOnFind);
      } else {
        softDel.populate(options.populate);
      }
    }

    try {
      await softDel;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  async restoreManyByIds(_id: string[], options?: IDatabaseRestoreManyOptions<ClientSession>): Promise<boolean> {
    const rest = this._repository
      .updateMany(
        {
          _id: {
            $in: _id,
          },
        },
        {
          $set: {
            deletedAt: undefined,
          },
        },
      )
      .where(DATABASE_DELETED_AT_FIELD_NAME)
      .exists(true);

    if (options?.session) {
      rest.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        rest.populate(this._joinOnFind);
      } else {
        rest.populate(options.populate);
      }
    }

    try {
      await rest;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  async restoreMany(find: Record<string, any>, options?: IDatabaseRestoreManyOptions<ClientSession>): Promise<boolean> {
    const rest = this._repository
      .updateMany(find, {
        $set: {
          deletedAt: undefined,
        },
      })
      .where(DATABASE_DELETED_AT_FIELD_NAME)
      .exists(true);

    if (options?.session) {
      rest.session(options.session);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        rest.populate(this._joinOnFind);
      } else {
        rest.populate(options.populate);
      }
    }

    try {
      await rest;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  async updateMany<Dto>(
    find: Record<string, any>,
    data: UpdateQuery<Dto>,
    options?: IDatabaseManyOptions<ClientSession>,
  ): Promise<boolean> {
    const update = this._repository
      .updateMany(find, {
        $set: data,
      })
      .where(DATABASE_DELETED_AT_FIELD_NAME)
      .exists(false);

    if (options?.session) {
      update.session(options.session as ClientSession);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        update.populate(this._joinOnFind);
      } else {
        update.populate(options.populate);
      }
    }

    try {
      await update;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  // raw

  async updateManyRaw(
    find: Record<string, any>,
    data: UpdateWithAggregationPipeline | UpdateQuery<Entity>,
    options?: IDatabaseManyOptions<ClientSession>,
  ): Promise<boolean> {
    const update = this._repository.updateMany(find, data).where(DATABASE_DELETED_AT_FIELD_NAME).exists(false);

    if (options?.session) {
      update.session(options.session as ClientSession);
    }

    if (options?.populate) {
      if (typeof options.populate === 'boolean') {
        if (!this._joinOnFind) {
          throw new Error('You should provide the populate option');
        }
        update.populate(this._joinOnFind);
      } else {
        update.populate(options.populate);
      }
    }

    try {
      await update;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  async raw<RawResponse, RawQuery = PipelineStage[]>(
    rawOperation: RawQuery,
    options?: IDatabaseRawOptions,
  ): Promise<RawResponse[]> {
    if (!Array.isArray(rawOperation)) {
      throw new Error('Must in array');
    }

    const pipeline: PipelineStage[] = rawOperation;
    if (!options?.withDeleted) {
      pipeline.push({
        $match: {
          [DATABASE_DELETED_AT_FIELD_NAME]: { $exists: false },
        },
      });
    }

    const aggregate = this._repository.aggregate<RawResponse>(pipeline);

    if (options?.session) {
      aggregate.session(options?.session);
    }

    return aggregate;
  }

  async rawFindAll<RawResponse, RawQuery = PipelineStage[]>(
    rawOperation: RawQuery,
    options?: IDatabaseRawFindAllOptions,
  ): Promise<RawResponse[]> {
    if (!Array.isArray(rawOperation)) {
      throw new Error('Must in array');
    }

    const pipeline: PipelineStage[] = rawOperation;
    if (!options?.withDeleted) {
      pipeline.push({
        $match: {
          [DATABASE_DELETED_AT_FIELD_NAME]: {
            $exists: false,
          },
        },
      });
    }

    if (options?.sort) {
      const keysOrder = Object.keys(options?.sort);
      pipeline.push({
        $sort: keysOrder.reduce(
          (a, b) => ({
            ...a,
            [b]: options?.sort![b] === OrderDirection.ASC ? 1 : -1,
          }),
          {},
        ),
      });
    }

    if (options?.paging) {
      pipeline.push(
        {
          $limit: options.paging.limit + options.paging.skip,
        },
        { $skip: options.paging.skip },
      );
    }

    const aggregate = this._repository.aggregate<RawResponse>(pipeline);

    if (options?.session) {
      aggregate.session(options?.session);
    }

    return aggregate;
  }

  async rawGetTotal<RawQuery = PipelineStage[]>(
    rawOperation: RawQuery,
    options?: IDatabaseRawGetTotalOptions,
  ): Promise<number> {
    if (!Array.isArray(rawOperation)) {
      throw new Error('Must in array');
    }

    const pipeline: PipelineStage[] = rawOperation;
    if (!options?.withDeleted) {
      pipeline.push({
        $match: {
          [DATABASE_DELETED_AT_FIELD_NAME]: {
            $exists: false,
          },
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    const aggregate = this._repository.aggregate(pipeline);

    if (options?.session) {
      aggregate.session(options?.session);
    }

    const raw = await aggregate;
    return raw && raw.length > 0 ? raw[0].count : 0;
  }

  async model(): Promise<Model<Entity>> {
    return this._repository;
  }
}
