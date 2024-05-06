import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import { CreateUserDto, CreateUserResDto, GetMeResDto, LoginDto, LoginResDto } from 'shared';
import { Logger } from 'winston';

import { Auth } from '@/decorators';
import { UserDocument } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';

import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginResDto,
    description: 'User info with access token',
  })
  async userLogin(@Body() loginDto: LoginDto): Promise<LoginResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'userLogin',
        method: 'POST',
        url: '/auth/login',
        body: loginDto,
        message: 'Login',
      }),
    });

    const user = await this.authService.validateUser(loginDto);

    const token = await this.authService.createAccessToken({
      userId: user._id.toString(),
      role: user.role!.name,
    });

    // const refreshToken = await this.authService.createRefreshToken({
    //   userId: user._id.toString(),
    // });

    return {
      userId: user._id.toString(),
      accessToken: token.accessToken,
      user,
      // refreshToken: refreshToken
    };
  }

  @Post()
  // @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Create user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CreateUserResDto,
  })
  async createUser(
    @Query()
    createUserDto: CreateUserDto,
  ): Promise<CreateUserResDto> {
    this.logger.info({
      message: JSON.stringify({
        action: 'createUser',
        method: 'GET',
        url: '/users',
        message: 'Create user',
        query: createUserDto,
      }),
    });

    return {
      success: true,
      data: await this.userService.createUser(createUserDto),
    };
  }

  @Get('/me')
  @Auth()
  @ApiOperation({
    summary: 'Get me',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetMeResDto,
  })
  getMe(@AuthUser() user: UserDocument): GetMeResDto {
    return { success: true, data: user };
  }
}
