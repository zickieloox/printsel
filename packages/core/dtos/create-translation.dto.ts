import { EnumField, StringField } from '@core/decorators/field.decorator';
import { LanguageCode } from 'shared';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  languageCode: LanguageCode;

  @StringField()
  text: string;
}
