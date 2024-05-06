import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { TokenType } from 'core';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RoleType } from 'shared';

import { UserService } from '@/modules/user/user.service';
import { ApiConfigService } from '@/shared/services';

import type { UserDocument } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ApiConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: { userId: string; role: RoleType; type: TokenType }): Promise<UserDocument> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findByIdOrUsernameOrEmail({
      _id: args.userId,
    });

    // @ts-expect-error hide password
    user.password = undefined;

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
