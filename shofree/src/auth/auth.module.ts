import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [ ClientsModule.register([
    {
      name: 'AUTH_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'cms-queue',
      },
    },
  ])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
