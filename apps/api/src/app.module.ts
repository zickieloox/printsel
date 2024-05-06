import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import dotenv from 'dotenv';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { format, transports } from 'winston';
import rotateFile from 'winston-daily-rotate-file';

import { AuthModule } from '@/modules/auth/auth.module';
import { CounterModule } from '@/modules/counter/counter.module';
// import { CronjobModule } from '@/modules/cronjob/cronjob.module';
import { PermissionModule } from '@/modules/permission/permission.module';
import { RoleModule } from '@/modules/role/role.module';
import { UserModule } from '@/modules/user/user.module';
import { WinstonModule } from '@/modules/winston/winston.module';

import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';
import { UploadModule } from './modules/upload/upload.module';
import { ApiConfigService } from './shared/services';
import { SharedModule } from './shared/shared.module';

dotenv.config();
@Module({
  imports: [
    AuthModule,
    UserModule,
    CounterModule,
    // CronjobModule,
    RoleModule,
    PermissionModule,
    CategoryModule,
    UploadModule,
    ProductVariantModule,
    ProductModule,
    // OrderModule,
    // OrderItemModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? ''}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => ({
        uri: configService.mongodbURI,
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      }),
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          // path: './i18n/',
          path: path.join(__dirname, 'i18n'),
          watch: configService.isDevelopment,
        },
      }),
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) =>
        apiConfigService.isDevelopment
          ? {
              level: 'info',
              format: format.json(),
              defaultMeta: { '@timestamp': new Date() },
              transports: [
                new transports.File({
                  filename: 'logs/activity.log',
                  level: 'error',
                }),
                new transports.Console({
                  format: format.simple(),
                }),
                new rotateFile({
                  filename: 'logs/application-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  zippedArchive: true,
                  maxSize: '20m',
                  maxFiles: '14d',
                }),
              ],
            }
          : {
              level: 'activity',
              format: format.json(),
              defaultMeta: { service: 'user-service' },
              transports: [
                new transports.File({
                  filename: 'logs/activity.log',
                  level: 'error',
                }),
                new transports.Console({
                  format: format.simple(),
                }),
                new rotateFile({
                  filename: 'logs/application-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  zippedArchive: true,
                  maxSize: '20m',
                  maxFiles: '14d',
                }),
              ],
            },
    }),
    ScheduleModule.forRoot(),
    // disable redoc temporarily
    ServeStaticModule.forRoot({
      rootPath: path.resolve('./src/assets'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: {
        setHeaders: (res, filepath) => {
          if (filepath.endsWith('doc.html')) {
            res.setHeader('Content-Security-Policy', '');
          }
        },
      },
    }),
    // HealthCheckerModule,
  ],
  // providers: [
  //   {
  //     provide: APP_PIPE,
  //     useValue: new ZodValidationPipe({ errorHttpStatusCode: 422 }),
  //   },
  // ],
})
export class AppModule {}
