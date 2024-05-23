import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/user/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    username: string;
    password: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
  }> | null {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(userDto: LoginDto) {
    try {
      const user = await this.validateUser(userDto.email, userDto.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const accessToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
      });

      return {
        message: 'Login successful',
        statusCode: HttpStatus.OK,
        accessToken: accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return {
          message: 'Email or password incorrect',
          statusCode: HttpStatus.UNAUTHORIZED,
        };
      } else {
        return {
          message: 'Internal Server Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    }
  }
}
