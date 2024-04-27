import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AwsS3Service, TelegramService } from 'core';

import { ApiConfigService } from './services';
import { SharedController } from './shared.controller';

const providers: Provider[] = [
  ApiConfigService,
  {
    provide: TelegramService,
    useFactory: (configService: ApiConfigService) =>
      new TelegramService({
        botToken: configService.telegram.botToken,
      }),
    inject: [ApiConfigService],
  },
  {
    provide: AwsS3Service,
    useFactory: (configService: ApiConfigService) =>
      new AwsS3Service({
        endpoint: configService.awsS3Config.endpoint,
        bucketApiVersion: configService.awsS3Config.bucketApiVersion,
        bucketRegion: configService.awsS3Config.bucketRegion.split('/')[0],
        bucketName: configService.awsS3Config.bucketName,
        accessKey: configService.awsS3Config.accessKey,
        secretKey: configService.awsS3Config.secretKey,
      }),
    inject: [ApiConfigService],
  },
];

@Global()
@Module({
  providers,
  imports: [CqrsModule],
  exports: [...providers, CqrsModule],
  controllers: [SharedController],
})
export class SharedModule {}
