import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserResponseDto } from './dto/response.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: RegisterDto) {
    try {
      const userAlreadyRegistered = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: createUserDto.username },
            { email: createUserDto.email },
          ],
        },
      });

      if (userAlreadyRegistered) {
        throw new HttpException(
          {
            error: 'User already registered',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const hashPassword = await bcrypt.hash(createUserDto.password, 12);
      await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          password: hashPassword,
        },
      });

      return { message: 'User registered successfully', statusCode: HttpStatus.CREATED };
    } catch (error) {
      if (error.status === 400) {
        return {
          statusCode: error.status,
          message: error.response.error,
        };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        };
      }
    }
  }

  responseUser(user: Prisma.UserCreateInput): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
