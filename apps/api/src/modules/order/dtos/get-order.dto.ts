import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  BooleanFieldOptional,
  NumberFieldOptional,
  PageOptionsDto,
  ResponseDto,
  StringField,
  StringFieldOptional,
} from 'core';

export class ResponseOrderDto extends ResponseDto {
  @ApiPropertyOptional()
  declare readonly data?: unknown;
}

export class GetStatisticDto {
  @StringFieldOptional()
  from: string;

  @StringFieldOptional()
  to: string;
}

export class GetOrdersDto extends PageOptionsDto {
  @StringFieldOptional()
  productId: string;

  @StringFieldOptional()
  status: string;

  @BooleanFieldOptional({ default: false })
  singleItems: boolean;

  @StringFieldOptional()
  from: string;

  @StringFieldOptional()
  to: string;

  @StringFieldOptional()
  storeCode: string;
}

export class GetOrderDto {
  @StringFieldOptional({
    minLength: 0,
  })
  readonly q?: string;

  @NumberFieldOptional({
    minimum: 1,
    default: 1,
    int: true,
  })
  readonly pageIndex: number = 1;

  @NumberFieldOptional({
    minimum: 1,
    maximum: 100,
    default: 50,
    int: true,
  })
  readonly totalItem: number = 50;

  @StringField()
  startDate: string;

  @StringField()
  endDate: string;

  @StringFieldOptional({
    default: null,
  })
  status: string | null;

  @StringFieldOptional({
    default: null,
  })
  productId: string | null;

  @StringFieldOptional({
    default: null,
  })
  variantId: string | null;

  @StringFieldOptional({
    default: null,
  })
  factoryId: string | null;

  @BooleanFieldOptional({
    default: false,
  })
  priority: boolean;
}

export class GetDetailOrderDto {
  @StringField()
  externalId: string;
}

export class GetBarcodeOrderDto {
  @ApiPropertyOptional({
    default: 'pre-production',
  })
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  variantId: string;

  @ApiPropertyOptional()
  @IsOptional()
  partnerId: string;

  @StringFieldOptional({
    default: 'normal',
  })
  shipping: string;

  @ApiPropertyOptional({
    default: null,
  })
  @IsOptional()
  exported: string;

  @StringField({
    default: 'basic',
  })
  orderType: string;

  @BooleanFieldOptional({
    default: false,
  })
  priority: boolean;
}
