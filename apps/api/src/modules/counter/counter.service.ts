import { Injectable } from '@nestjs/common';
import type mongoose from 'mongoose';

import type { CounterEntity } from './counter.entity';
import { CounterRepository } from './counter.repository';

@Injectable()
export class CounterService {
  constructor(private counterRepository: CounterRepository) {}

  async findAndUpdateCounter(key: string, session?: mongoose.ClientSession): Promise<CounterEntity | null> {
    let counter = await this.counterRepository.findOneAndUpdate({ key }, { $inc: { seq: 1 } });

    if (!counter) {
      counter = await this.counterRepository.create({ key, seq: 1 }, { session });
    }

    return counter;
  }
}
