import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/ZodValidationPipe';
import { LoginDto, loginSchema } from 'src/auth/dto/auth.dto';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  create(@Body() createUserDto: RegisterDto) {
    return this.authService.register(createUserDto);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.authService.getUser(userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async getCurrentUser(@Request() req) {
    return this.authService.getUser(req.user.id);
  }
}
