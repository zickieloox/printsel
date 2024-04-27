import type { Provider } from '@nestjs/common';
import { WINSTON_MODULE_OPTIONS, WINSTON_MODULE_PROVIDER } from 'core';
import type { LoggerOptions } from 'winston';
import { createLogger } from 'winston';

import type { IWinstonModuleAsyncOptions, WinstonModuleOptions } from './winston.interfaces';

/**
 * Constructor a winston provider
 * @param loggerOpts
 */
export const createWinstonProviders = (loggerOpts: WinstonModuleOptions): Provider[] => [
  {
    provide: WINSTON_MODULE_PROVIDER,
    useFactory: () => createLogger(loggerOpts),
  },
];

/**
 * Async constructor for a winston provider
 * @param options
 */
export const createWinstonAsyncProviders = (options: IWinstonModuleAsyncOptions): Provider[] => [
  {
    provide: WINSTON_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  },
  {
    provide: WINSTON_MODULE_PROVIDER,
    useFactory: (loggerOpts: LoggerOptions) => createLogger(loggerOpts),
    inject: [WINSTON_MODULE_OPTIONS],
  },
];
