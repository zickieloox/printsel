import { default as multipart } from '@fastify/multipart';
import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import compression from 'compression';
import { CustomExceptionFilter, UnprocessableEntityFilter } from 'core';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { I18nService } from 'nestjs-i18n';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services';
import { SharedModule } from './shared/shared.module';

export async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { cors: true });
  const ObjectId = mongoose.Types.ObjectId;

  ObjectId.prototype.valueOf = function () {
    return this.toString();
  };

  const configService = app.select(SharedModule).get(ApiConfigService);

  if (configService.isProduction) {
    // app.enable('trust proxy');
  }

  void app.register(multipart);
  app.use(helmet());
  // app.setGlobalPrefix('/api'); use api as global prefix if you don't have subdomain
  // app.use(
  //   rateLimit({
  //     windowMs: 1 * 60 * 1000, // 1 minutes
  //     max: 100, // limit each IP to 100 requests per windowMs
  //   }),
  // );
  // app.enableCors();
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();
  app.setGlobalPrefix('api/v1');

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new CustomExceptionFilter(configService.isDevelopment, app.select(SharedModule).get(I18nService)),
    new UnprocessableEntityFilter(reflector, configService.isDevelopment, app.select(SharedModule).get(I18nService)),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  // Starts listening for shutdown hooks
  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  const port = configService.appConfig.port;

  if (!process.env.VITE) {
    await app.listen(port, '0.0.0.0');
    console.info(`server running on ${await app.getUrl()}`);
  }

  return app;
}

void bootstrap();
