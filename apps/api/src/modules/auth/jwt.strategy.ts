import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenType } from 'core';

import type { RoleType } from '@/constants';
import type { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { ApiConfigService } from '@/shared/services';

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

  async validate(args: { userId: string; role: RoleType; type: TokenType }): Promise<UserEntity> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({
      _id: new Types.ObjectId(args.userId) as never,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
