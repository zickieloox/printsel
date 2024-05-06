import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replaceAll('\\n', '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE');
  }

  get mongodbURI(): string {
    return this.getString('DB_URI');
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      imagesBucketName: this.getString('AWS_S3_IMAGES_BUCKET_NAME'),
      accessKey: this.getString('AWS_S3_ACCESS_KEY_ID'),
      secretKey: this.getString('AWS_S3_SECRET_ACCESS_KEY'),
      endpoint: this.getString('AWS_S3_ENDPOINT'),
      backblazeEndpoint: this.getString('BACKBLAZE_ENDPOINT'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  get domainName(): string {
    return this.getString('DOMAIN_NAME');
  }

  get captchaToken(): string {
    return this.getString('RECAPTCHA_SECRET_KEY');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }

  get adminEmail(): string {
    return this.getString('ADMIN_EMAIL');
  }

  get smtpConfig() {
    return {
      host: this.getString('SMTP_HOST'),
      user: this.getString('SMTP_USER'),
      password: this.getString('SMTP_PASSWORD'),
      from: this.getString('SMTP_FROM'),
    };
  }

  get telegram() {
    return {
      botToken: this.getString('TELEGRAM_BOT_TOKEN'),
      channelId: this.getString('TELEGRAM_CHANNEL_ID'),
    };
  }

  get cdn() {
    return {
      url: this.getString('CDN_URL'),
    };
  }

  get bottleneck() {
    return {
      downloadImagesMaxConcurrent: this.getString('DOWNLOAD_IMAGES_MAX_CONCURRENT'),
      downloadImagesMaxRetry: this.getString('DOWNLOAD_IMAGES_MAX_RETRY'),
      uploadImagesMaxRetry: this.getString('UPLOAD_IMAGES_MAX_RETRY'),
    };
  }
}
