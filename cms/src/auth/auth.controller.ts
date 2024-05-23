import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from 'src/user/dto/login.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth-login' })
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
