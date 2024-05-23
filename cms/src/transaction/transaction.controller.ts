import { Controller } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionDto } from './dto/transaction.dto';
import { ProductDto } from './dto/product.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @MessagePattern({ cmd: 'transaction-deposit' })
  async deposit(@Payload() depositDto) {
    return this.transactionService.deposit(
      depositDto.amount,
      depositDto.userId,
    );
  }

  @MessagePattern({ cmd: 'transaction-withdraw' })
  async withdraw(@Payload() withdrawDto) {
    return this.transactionService.withdraw(
      withdrawDto.amount,
      withdrawDto.userId,
    );
  }

  @MessagePattern({ cmd: 'transaction-get' })
  async getTransaction(
    @Payload() transaction: { transaction: TransactionDto },
  ) {
    return this.transactionService.getTransaction(transaction.transaction);
  }

  @MessagePattern({ cmd: 'transaction-purchase' })
  async purchase(
    @Payload() purchaseDto: { products: ProductDto; userId: string },
  ) {
    return this.transactionService.purchase(
      purchaseDto.products,
      purchaseDto.userId,
    );
  }
}
