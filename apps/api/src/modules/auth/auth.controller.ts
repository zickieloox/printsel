import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UsePipes } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'core';
import { Logger } from 'winston';

import { Auth } from '@/decorators';
import { UserDocument } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';

import { AuthService } from './auth.service';
import { RoleType } from '@/constants';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { CreateUserResDto, CreateUserDto, GetMeResDto, LoginResDto, LoginDto } from '../user/user.dto';

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
  @ApiCreatedResponse({
    type: LoginResDto,
    description: 'User info with access token',
  })
  @UsePipes(ZodValidationPipe)
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
      role: user.role?.name!,
    });

    // const refreshToken = await this.authService.createRefreshToken({
    //   userId: user._id.toString(),
    // });

    return {
      userId: user._id.toString(),
      accessToken: token.accessToken,
      /// @ts-ignore
      user: user,
      // refreshToken: refreshToken
    };
  }

  @Post()
  // @Auth([RoleType.Admin])
  @ApiOperation({
    summary: 'Create user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: CreateUserResDto,
  })
  @UsePipes(ZodValidationPipe)
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

    /// @ts-ignore
    return await this.userService.createUser(createUserDto);
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
  @UsePipes(ZodValidationPipe)
  getMe(@AuthUser() user: UserDocument): GetMeResDto {
    /// @ts-ignore
    return user;
  }
}
