import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserNotFoundException, validateHash } from 'core';
import { TokenType } from 'core';

import type { UserDocument } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { ApiConfigService } from '@/shared/services';

import { TokenPayloadDto } from './dtos';
import { RoleType } from '@/constants';
import { LoginDto } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
    // private recaptchaService: RecaptchaService,
  ) {}

  async createAccessToken(data: { role: RoleType; userId: string }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync(
        {
          userId: data.userId,
          type: TokenType.ACCESS_TOKEN,
          role: data.role,
        },
        {
          privateKey: this.configService.authConfig.privateKey,
        },
      ),
    });
  }

  async createRefreshToken(data: { userId: string }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.REFRESH_TOKEN,
      }),
    });
  }

  async validateUser(LoginDto: LoginDto): Promise<UserDocument> {
    // if (!this.configService.isTest) {
    //   const isVerifyRecaptcha = await this.recaptchaService.verifyRecaptcha(LoginDto.recaptchaToken);

    //   if (!isVerifyRecaptcha.success) {
    //     throw new BadRequestException('Failed to verify reCAPTCHA');
    //   }

    //   if (isVerifyRecaptcha.score < 0.3) {
    //     throw new BadRequestException('You are Bot');
    //   }
    // }

    const user = await this.userService.findByUsernameOrEmail({
      email: LoginDto.email,
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordValid = await validateHash(LoginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
