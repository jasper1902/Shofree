import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'auth-register' })
  async register(@Payload() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @MessagePattern({ cmd: 'auth-get-user' })
  async getUser(@Payload() userId: string) {
    const user = await this.userService.findById(userId);
    return { user: this.userService.responseUser(user) };
  }
}
