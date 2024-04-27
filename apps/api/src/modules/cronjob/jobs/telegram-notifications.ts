import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramService } from 'core';
import { Logger } from 'winston';

import { OrderRepository } from '@/modules/order/order.repository';
import { UserRepository } from '@/modules/user/user.repository';

@Injectable()
export class TelegramNotificationJob {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  @Cron('0 0 5 31 2 *', {
    name: 'TELEGRAM-NOTIFICATIONS',
  })
  async telegramOrderSummaryNotification() {
    this.logger.info('=== CronJob TELEGRAM-NOTIFICATIONS: Run ===');

    try {
      const users = await this.userRepository.findAll({ 'telegramConfig.isNotificationEnabled': true });

      const fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date();
      toDate.setHours(23, 59, 59, 999);

      const orders = await this.orderRepository.findAll({
        user: { $in: users.map((user) => user._id) },
        updatedAt: { $gte: fromDate, $lte: toDate },
      });

      const summary: Record<string, unknown> = {};

      for (const user of users) {
        const summaryOrderInDay: Record<string, number> = {};
        const ordersOfUser = orders.filter((order) => `${order.user._id}` === user._id.toString());

        for (const o of ordersOfUser) {
          summaryOrderInDay[o.status] = (summaryOrderInDay[o.status] || 0) + 1;
        }

        summary[`${user._id}`] = summaryOrderInDay;
      }

      const sendNotificationPromise = [];

      for (const user of users) {
        const { telegramConfig, _id } = user;

        if (
          !telegramConfig ||
          !telegramConfig.telegramChannelId ||
          !telegramConfig.telegramBotToken ||
          !summary[`${_id}`]
        ) {
          continue;
        }

        const { telegramChannelId, telegramBotToken } = telegramConfig;
        const telegramNotification = new TelegramService({ botToken: telegramBotToken });

        sendNotificationPromise.push(
          telegramNotification.sendMessageToChannel(telegramChannelId, JSON.stringify(summary[`${_id}`])),
        );
      }

      await Promise.all(sendNotificationPromise);

      this.logger.info('=== CronJob TELEGRAM-NOTIFICATIONS: Complete ===');
    } catch (error) {
      console.error('Error telegram notifications:', error);

      this.logger.info('=== CronJob TELEGRAM-NOTIFICATIONS: Error ===');
    }
  }
}
