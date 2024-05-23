import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { TransactionDto } from './dto/transaction.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_SERVICE') private rabbitClient: ClientProxy,
  ) {}
  async withdraw(amount: number, userId: string) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'transaction-withdraw' }, { amount, userId })
          .pipe(timeout(5000)),
      );

      if (result.statusCode !== 201) {
        throw new BadRequestException(result.message);
      }

      return result;
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

  async deposit(amount: number, userId: string) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'transaction-deposit' }, { amount, userId })
          .pipe(timeout(5000)),
      );

      if (result.statusCode !== 201) {
        throw new Error('');
      }

      return result;
    } catch (error) {
      throw {
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getTransaction(transaction: TransactionDto) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'transaction-get' }, { transaction })
          .pipe(timeout(5000)),
      );

      if (result.statusCode !== 200) {
        throw new Error('Failed to retrieve transaction data from RabbitMQ');
      }

      return result;
    } catch (error) {
      throw {
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  

  async purchase(products: ProductDto, userId: string) {
    try {
      const result = await firstValueFrom(
        this.rabbitClient
          .send({ cmd: 'transaction-purchase' }, { products, userId })
          .pipe(timeout(5000)),
      );
      if (result.statusCode !== 201) {
        throw new BadRequestException(result.message);
      }

      return result;
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
}
