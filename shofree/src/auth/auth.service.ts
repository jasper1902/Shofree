import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private rabbitClient: ClientProxy) {}

  async login(loginDto: LoginDto) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'auth-login' }, loginDto)
          .pipe(timeout(5000)),
      );

      if (result.statusCode !== 200) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw {
          message: 'Email or password incorrect',
          statusCode: HttpStatus.UNAUTHORIZED,
        };
      } else {
        throw {
          message: 'Internal Server Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'auth-register' }, registerDto)
          .pipe(timeout(5000)),
      );

      if (result.statusCode !== 201) {
        throw new BadRequestException(result.message)
      }
      return result
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw {
          message: error.message,
          statusCode: HttpStatus.BAD_REQUEST,
        };
      } else {
        throw {
          message: 'Internal Server Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    }
  }

  getUser(userId: string) {
    return this.rabbitClient
      .send({ cmd: 'auth-get-user' }, userId)
      .pipe(timeout(5000));
  }
}
