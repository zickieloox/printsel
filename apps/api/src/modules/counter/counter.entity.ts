import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseEntity, DatabaseEntityAbstract } from 'core';
import type { HydratedDocument } from 'mongoose';
@DatabaseEntity({ collection: 'counters' })
export class CounterEntity extends DatabaseEntityAbstract {
  @Prop({
    required: true,
    unique: true,
  })
  key: string;

  @Prop({
    required: true,
  })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterEntity);

export type CounterDocument = HydratedDocument<CounterEntity>;
