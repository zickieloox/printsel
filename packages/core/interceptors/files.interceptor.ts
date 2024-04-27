/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { transformException } from '@core/utils';
import type { CallHandler, ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import { Inject, mixin, Optional } from '@nestjs/common';
import multer from 'fastify-multer';
import type { Observable } from 'rxjs';

import { MULTER_MODULE_OPTIONS, type MulterModuleOptions, type MulterOptions } from './file.interceptor';
type MulterInstance = any;

/**
 * @param fieldName
 * @param localOptions∂
 *
 * @publicApi
 */
export function FilesInterceptor(
  fieldName: string,
  maxCount?: number,
  localOptions?: MulterOptions,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
      @Optional()
      @Inject(MULTER_MODULE_OPTIONS)
      options: MulterModuleOptions = {},
    ) {
      this.multer = (multer as any)({
        ...options,
        ...localOptions,
      });
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) =>
        this.multer.array(fieldName, maxCount)(ctx.getRequest(), ctx.getResponse(), (err: any) => {
          if (err) {
            const error = transformException(err);

            return reject(error);
          }

          resolve();
        }),
      );

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
