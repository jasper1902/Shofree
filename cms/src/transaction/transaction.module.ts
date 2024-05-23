import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, UserService],
})
export class TransactionModule {}
