import type { ZodDtoStatic } from '@anatine/zod-nestjs/src/lib/create-zod-dto';
import { default as multipart } from '@fastify/multipart';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import compression from 'compression';
import { CustomExceptionFilter } from 'core';
import helmet from 'helmet';
import morgan from 'morgan';
import { I18nService } from 'nestjs-i18n';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services';
import { SharedModule } from './shared/shared.module';

export async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { cors: true });
  // const ObjectId = mongoose.Types.ObjectId;

  // ObjectId.prototype.valueOf = function () {
  //   return this.toString();
  // };

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

  // const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new CustomExceptionFilter(configService.isDevelopment, app.select(SharedModule).get(I18nService)),
    // new UnprocessableEntityFilter(reflector, configService.isDevelopment, app.select(SharedModule).get(I18nService)),
  );

  @Injectable()
  class ZodValidationPipe implements PipeTransform {
    public transform(value: unknown, metadata: ArgumentMetadata): unknown {
      const zodSchema = (metadata.metatype as ZodDtoStatic).zodSchema;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (zodSchema) {
        const parseResult = zodSchema.safeParse(value);

        if (!parseResult.success) {
          const { error } = parseResult;
          const message = error.errors.map((error2) => `${error2.path.join('.')}: ${error.message}`);

          console.log('🚀 ~ ZodValidationPipe ~ transform ~ message:', message);

          throw new UnprocessableEntityException(message);
        }

        return parseResult.data;
      }

      return value;
    }
  }

  app.useGlobalPipes(new ZodValidationPipe());

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
