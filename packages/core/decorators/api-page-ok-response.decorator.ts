import { PageResponseDto } from '@core/dtos';
import type { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPageOkResponse<T extends Type>(options: { type: T; description?: string }): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(PageResponseDto),
    ApiExtraModels(options.type),
    ApiOkResponse({
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(options.type) },
              },
            },
          },
        ],
      },
    }),
  );
}
