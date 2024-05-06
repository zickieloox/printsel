import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, UnprocessableEntityException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import type { FastifyReply } from 'fastify';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityFilter implements ExceptionFilter<UnprocessableEntityException> {
  constructor(
    public reflector: Reflector,
    private readonly isDevelopment: boolean,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: UnprocessableEntityException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const statusCode = exception.getStatus();

    let stackTrace;

    if (this.isDevelopment) {
      stackTrace = exception.stack;
      console.error(stackTrace);
    }

    const exceptionResponse = exception.getResponse() as {
      message: ValidationError[];
    };

    const validationErrors = exceptionResponse.message;
    // this.validationFilter(validationErrors);

    if (validationErrors.length > 0) {
      const constrains = validationErrors[0].constraints;

      if (constrains) {
        const keys = Object.keys(constrains);

        let target = '';

        if (validationErrors[0].target) {
          target =
            validationErrors[0].property +
            ' = `' +
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/ban-types
            validationErrors[0].target[validationErrors[0].property as keyof object] +
            '` - ';
        }

        let message = `error.fields.${keys[0]}`;

        const translation: string = await this.i18n.t(message, { lang: I18nContext.current()?.lang });

        message = target + translation;

        await response.status(statusCode).send({
          success: false,
          message,
          stackTrace,
        });
      }
    }
  }
}
