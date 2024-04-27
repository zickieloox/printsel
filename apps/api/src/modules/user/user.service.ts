import { BadRequestException, Injectable } from '@nestjs/common';
import {
  convertEndDate,
  convertStartDate,
  generateHash,
  generateRandomPassword,
  UserNotFoundException,
  validateHash,
} from 'core';
import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { authenticator } from 'otplib';
import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from 'core';

import { RoleRepository } from '../role/role.repository';
import type { UserDocument, UserEntity } from './user.entity';
import { UserRepository } from './user.repository';
import { CreateUserDto, GetUsersDto, GetUsersResDto, UpdateUserDto } from './user.dto';

const customNanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
  ) {}

  findByUserCode(userCode: string): Promise<UserDocument | null> {
    return this.userRepository.findOne({ userCode });
  }

  async findOne(findData: FilterQuery<UserEntity>): Promise<UserDocument | null> {
    // console.log(user);

    return await this.userRepository.findOne(findData, { populate: { path: 'role', select: 'name' } });
  }

  findByUsernameOrEmail(options: Partial<{ username: string; email: string }>): Promise<UserDocument | null> {
    return this.userRepository.findOne(options, { populate: { path: 'role', select: 'name' }, select: ['+password'] });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const checkUser = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (checkUser) {
      throw new BadRequestException('User already exists');
    }

    const password = 'Prtsel434@1'; // generateRandomPassword(16);
    const passwordHash = generateHash(password);

    console.log(passwordHash);

    const role = await this.roleRepository.findOneById(`${createUserDto.roleId}`);

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    const createdUser = await this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
      roleId: new Types.ObjectId(createUserDto.roleId),
      userCode: customNanoid(6),
    });

    return createdUser;
  }

  async updateUser(updateUserDto: UpdateUserDto, user: UserDocument): Promise<UserEntity> {
    const { fullName, phone, email, gender, address } = updateUserDto;
    const update: Record<string, unknown> = {
      fullName,
      phone,
      email,
      gender,
      address,
    };

    const updatedUser = await this.userRepository.findOneAndUpdate({ _id: user._id }, update);

    if (!updatedUser) {
      throw new UserNotFoundException();
    }

    return updatedUser;
  }

  // async updateUserByAdmin(id: string, userUpdateDto: UserUpdateDto): Promise<UserEntity> {
  //   const { fullName, phone, email, gender, address, roleId } = userUpdateDto;
  //   const update: Record<string, unknown> = {
  //     fullName,
  //     phone,
  //     email,
  //     gender,
  //     address,
  //   };

  //   if (roleId) {
  //     const role = await this.roleRepository.findOneById(roleId);

  //     if (!role) {
  //       throw new BadRequestException('Invalid role');
  //     }

  //     update.role = role._id;
  //   }

  //   const updatedUser = await this.userRepository.findOneByIdAndUpdate(id, update);

  //   if (!updatedUser) {
  //     throw new UserNotFoundException();
  //   }

  //   return updatedUser;
  // }

  async getUsers(getUsersDto: GetUsersDto): Promise<GetUsersResDto> {
    const { limit, page, fullName, userCode, email, startDate, endDate, ...filter } = getUsersDto;
    let query = {};

    if (fullName) {
      query = {
        $or: [
          { fullName: { $regex: fullName, $options: 'i' } },
          { email: { $regex: email, $options: 'i' } },
          { userCode: { $regex: userCode, $options: 'i' } },
          { email: { $regex: filter.search, $options: 'i' } },
        ],
      };
    }

    if (filter.search) {
      query = {
        $or: [
          { fullName: { $regex: filter.search, $options: 'i' } },
          { email: { $regex: filter.search, $options: 'i' } },
        ],
      };
    }

    delete filter.search;

    if (startDate && endDate) {
      query = {
        createdAt: {
          $gte: convertStartDate(startDate),
          $lte: convertEndDate(endDate),
        },
        ...query,
      };
    }

    const [users, total] = await this.userRepository.findAllAndCount(
      {
        ...query,
      },
      {
        paging: {
          limit,
          skip: limit! * (page! - 1),
        },
        join: {
          path: 'role',
          select: ['_id', 'name', 'code'],
        },
        sort: {
          updatedAt: ENUM_PAGINATION_ORDER_DIRECTION_TYPE.DESC,
        },
      },
    );

    return {
      /// @ts-ignore
      data: users,
      total,
    };
  }

  // async resetPassword(resetPassDto: ResetPassDto): Promise<boolean> {
  //   const user = await this.userRepository.findOne({ email: resetPassDto.email });

  //   if (!user) {
  //     throw new UserNotFoundException();
  //   }

  //   const password = generateRandomPassword(16);
  //   const passwordHash = generateHash(password);

  //   await this.userRepository.findOneAndUpdate({ email: resetPassDto.email }, { password: passwordHash });

  //   return true;
  // }

  // async changePassword(user: UserDocument, changePassDto: ChangePassDto) {
  //   const myUser = await this.userRepository.findOneById(`${user._id}`, {
  //     select: ['+password'],
  //   });

  //   if (!myUser) {
  //     throw new UserNotFoundException();
  //   }

  //   if (changePassDto.newPassword !== changePassDto.confirmPassword) {
  //     throw new BadRequestException('Confirm password is not the same new password');
  //   }

  //   const isPasswordValid = await validateHash(changePassDto.currentPassword, myUser.password);

  //   if (!isPasswordValid) {
  //     throw new BadRequestException('Password is incorrect');
  //   }

  //   const isNewPasswordValid = await validateHash(changePassDto.newPassword, myUser.password);

  //   if (isNewPasswordValid) {
  //     throw new BadRequestException('New password can not be the same old password ');
  //   }

  //   const passwordHash = generateHash(changePassDto.newPassword);

  //   return await this.userRepository.findOneByIdAndUpdate(`${myUser._id}`, { password: passwordHash });
  // }

  // async updateUserPermissions(userId: string, updateUserPermissionsDto: UpdateUserPermissionsDto): Promise<void> {
  //   const { permissionIds } = updateUserPermissionsDto;
  //   const user = await this.userRepository.findOneByIdAndUpdate(userId, { otherPermissions: permissionIds });

  //   if (!user) {
  //     throw new UserNotFoundException();
  //   }
  // }

  async getSecret(user: UserDocument): Promise<string> {
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = authenticator.generateSecret();
    await this.userRepository.updateOne({ _idd: user._id }, { secret });

    return secret;
  }

  // async verify2faOtp(user: UserDocument, verify2faOtpDto: Verify2faOtpDto) {
  //   const { _id, secret, twoFactorEnabled } = user;
  //   const myUser = await this.userRepository.findOneById(`${_id}`, {
  //     select: ['+password'],
  //   });

  //   if (twoFactorEnabled) {
  //     throw new BadRequestException('2FA is already enabled');
  //   }

  //   const isValid = authenticator.check(verify2faOtpDto.otp, String(secret));

  //   if (!isValid) {
  //     throw new BadRequestException('OTP is incorrect');
  //   }

  //   const isPasswordValid = await validateHash(verify2faOtpDto.password, myUser?.password);

  //   if (!isPasswordValid) {
  //     throw new BadRequestException('Password is invalid');
  //   }

  //   await this.userRepository.updateOne({ _id }, { twoFactorEnabled: true });
  // }

  // async telegramNotifications(user: UserDocument, telegramNotificationDto: TelegramNotificationDto): Promise<boolean> {
  //   const { channelId, botToken, isEnabled } = telegramNotificationDto;

  //   return await this.userRepository.updateOne(
  //     { _id: user._id },
  //     {
  //       telegramConfig: {
  //         telegramChannelId: channelId,
  //         telegramBotToken: botToken,
  //         isNotificationEnabled: isEnabled,
  //       },
  //     },
  //   );
  // }
}
