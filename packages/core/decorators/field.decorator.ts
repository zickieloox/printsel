/* eslint-disable unicorn/no-null */
import { applyDecorators } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
  ValidateNested,
} from 'class-validator';

import { ApiEnumProperty, ApiUUIDProperty } from './property.decorator';
import {
  PhoneNumberSerializer,
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToObjectId,
  ToUpperCase,
  Trim,
} from './transform.decorator';
import {
  IsNullable,
  IsPassword,
  IsPhoneNumber,
  IsTmpKey as IsTemporaryKey,
  IsUndefinable,
} from './validator.decorator';
// import { supportedLanguageCount } from '..';
const supportedLanguageCount = 2;

type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
}

interface INumberFieldOptions extends IFieldOptions {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

type IClassFieldOptions = IFieldOptions;
type IBooleanFieldOptions = IFieldOptions;
type IEnumFieldOptions = IFieldOptions;

interface IArrayFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
}

export function NumberField(options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {}): PropertyDecorator {
  const decorators = [Type(() => Number)];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Number, ...options }));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.int) {
    decorators.push(IsInt({ each: options.each }));
  } else {
    decorators.push(IsNumber({}, { each: options.each }));
  }

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min, { each: options.each }));
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max, { each: options.each }));
  }

  if (options.isPositive) {
    decorators.push(IsPositive({ each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), NumberField({ required: false, ...options }));
}

export function StringField(options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator {
  const decorators = [Type(() => String), IsString({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options, isArray: options.each }));
  }

  decorators.push(Trim());

  const minLength = options.minLength || 0;

  decorators.push(MinLength(minLength, { each: options.each }));

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), StringField({ required: false, ...options }));
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField({ ...options, minLength: 8 }), IsPassword()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), PasswordField({ required: false, ...options }));
}

export function BooleanField(options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {}): PropertyDecorator {
  const decorators = [ToBoolean(), IsBoolean()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Boolean, ...options }));
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), BooleanField({ required: false, ...options }));
}

export function TranslationsField(
  options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> & IFieldOptions,
): PropertyDecorator {
  const decorators = [
    ArrayMinSize(supportedLanguageCount),
    ArrayMaxSize(supportedLanguageCount),
    ValidateNested({
      each: true,
    }),
    Type(() => options.type as FunctionConstructor),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ isArray: true, ...options }));
  }

  return applyDecorators(...decorators);
}

export function TranslationsFieldOptional(
  options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> & IFieldOptions,
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), TranslationsField({ required: false, ...options }));
}

export function TmpKeyField(options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator {
  const decorators = [StringField(options), IsTemporaryKey({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options, isArray: options.each }));
  }

  return applyDecorators(...decorators);
}

export function TmpKeyFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), TmpKeyField({ required: false, ...options }));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'isArray'> & IEnumFieldOptions = {},
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types
  const enumValue = getEnum();
  const decorators = [IsEnum(enumValue, { each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.swagger !== false) {
    decorators.push(ApiEnumProperty(getEnum, { ...options, isArray: options.each }));
  }

  return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassField<TClass extends object>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classValue = getClass() as any;

  if (!classValue) {
    throw new Error('ClassField: recursive class definition');
  }

  const decorators = [Type(() => classValue), ValidateNested({ each: options.each })];

  if (options.required !== false) {
    decorators.push(IsDefined());
  }

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: () => classValue,
        ...options,
      }),
    );
  }

  // if (options.each) {
  //   decorators.push(ToArray());
  // }

  return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumFieldOptional<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> & IEnumFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), EnumField(getEnum, { required: false, ...options }));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassFieldOptional<TClass extends object>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IClassFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), ClassField(getClass, { required: false, ...options }));
}

export function EmailField(options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator {
  const decorators = [IsEmail(), StringField({ toLowerCase: true, ...options })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), EmailField({ required: false, ...options }));
}

export function PhoneField(options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {}): PropertyDecorator {
  const decorators = [IsPhoneNumber(), PhoneNumberSerializer()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), PhoneField({ required: false, ...options }));
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsUUID('4', { each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiUUIDProperty(options));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), UUIDField({ required: false, ...options }));
}

export function URLField(options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator {
  const decorators = [StringField(options), IsUrl({}, { each: true })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function URLFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), URLField({ required: false, ...options }));
}

export function DateField(options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {}): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Date, ...options }));
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), DateField({ ...options, required: false }));
}

// More customized decorators

export function ArrayField(options: ApiPropertyOptions & IArrayFieldOptions = {}): PropertyDecorator {
  const decorators = [IsArray({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: options.type || String, ...options, isArray: true }));
  }

  return applyDecorators(...decorators);
}

export function ArrayFieldOptional(
  options: Omit<ApiPropertyOptions, 'required'> & IArrayFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), ArrayField({ required: false, ...options }));
}

export function ObjectIdField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField(), ToObjectId()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ format: 'ID', ...options }));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function ObjectIdFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), ObjectIdField({ required: false, ...options }));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function DataField<TData extends object>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: TData,
  options: Omit<ApiPropertyOptions, 'type' | 'format'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: data,
        ...options,
      }),
    );
  }

  return applyDecorators(...decorators);
}
