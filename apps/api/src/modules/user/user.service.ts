import { BadRequestException, Injectable } from '@nestjs/common';
import { convertEndDate, convertStartDate, generateHash, OrderDirection, UserNotFoundException } from 'core';
import type { FilterQuery } from 'mongoose';
import { CODE_LENGTH, type CreateUserDto, type GetUsersDto, type GetUsersResDto, type UpdateUserDto } from 'shared';

import { genCode } from '@/utils';

import { RoleRepository } from '../role/role.repository';
import type { UserDocument, UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

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
    return await this.userRepository.findOne(findData, { populate: { path: 'role', select: 'name' } });
  }

  async findByIdOrUsernameOrEmail(
    options: Partial<{ _id: string; username: string; email: string }>,
  ): Promise<UserDocument | null> {
    return await this.userRepository.findOne(options, {
      populate: { path: 'role', select: 'name' },
      select: ['+password'],
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const checkUser = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (checkUser) {
      throw new BadRequestException('User already exists');
    }

    const password = createUserDto.password; // generateRandomPassword(16);
    const passwordHash = generateHash(password);

    console.log(passwordHash);

    const role = await this.roleRepository.findOneById(`${createUserDto.roleId}`);

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    return await this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
      roleId: createUserDto.roleId,
      userCode: genCode(CODE_LENGTH),
    });
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
    const { limit, page, startDate, endDate, search } = getUsersDto;

    let query = {};

    if (search) {
      query = {
        $or: [
          { userCode: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (startDate && endDate) {
      query = {
        createdAt: {
          $gte: convertStartDate(startDate),
          $lte: convertEndDate(endDate),
        },
        ...query,
      };
    }

    return await this.userRepository.findAllAndCount(
      {
        ...query,
      },
      {
        paging: {
          limit,
          skip: limit * (page - 1),
        },
        join: {
          path: 'role',
          select: ['name', 'code'],
        },
        sort: {
          updatedAt: OrderDirection.DESC,
        },
      },
    );
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

  // async getSecret(user: UserDocument): Promise<string> {
  //   if (user.twoFactorEnabled) {
  //     throw new BadRequestException('2FA is already enabled');
  //   }

  //   const secret = authenticator.generateSecret();
  //   await this.userRepository.updateOne({ _idd: user._id }, { secret });

  //   return secret;
  // }

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
