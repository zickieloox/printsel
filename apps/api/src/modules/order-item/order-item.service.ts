/* eslint-disable quote-props */
import { BadRequestException, Injectable } from '@nestjs/common';
import Bottleneck from 'bottleneck';

import { OrderItemRepository } from '@/modules/order-item/order-item.repository';

import { OrderRepository } from '../order/order.repository';
import type { UpdateNoteDto } from './dtos/update-note.dto';
import type { OrderItemEntity } from './order-item.entity';

@Injectable()
export class OrderItemService {
  downloadLimiter = new Bottleneck();

  uploadLimiter = new Bottleneck();

  constructor(
    private orderRepository: OrderRepository,
    private orderItemRepository: OrderItemRepository,
  ) {}

  async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<OrderItemEntity | null> {
    const { note } = updateNoteDto;
    const orderItem = await this.orderItemRepository.findOneById(id);

    if (!orderItem) {
      throw new BadRequestException('Order item not found');
    }

    return await this.orderItemRepository.findOneByIdAndUpdate(id, { sellerNote: note });
  }

  async updateSystemNote(id: string, updateNoteDto: UpdateNoteDto): Promise<OrderItemEntity | null> {
    const { note } = updateNoteDto;
    const orderItem = await this.orderItemRepository.findOneById(id);

    if (!orderItem) {
      throw new BadRequestException('Order item not found');
    }

    return await this.orderItemRepository.findOneByIdAndUpdate(id, { systemNote: note });
  }

  extractFileNameFromContent(content: string): string | undefined {
    const match = content.match(/<title>(.*?)<\/title>/i);

    if (!match || !match[1]) {
      return undefined;
    }

    const nestedMatch = match[1].split(' - ')[0];

    return nestedMatch && nestedMatch !== '' ? nestedMatch : undefined;
  }
}
