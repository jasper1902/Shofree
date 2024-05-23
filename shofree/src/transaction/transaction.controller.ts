import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ZodValidationPipe } from 'src/ZodValidationPipe';
import { AuthGuard } from '@nestjs/passport';
import { paymentSchema } from './dto/payment.dto';
import { productSchema } from './dto/product.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(paymentSchema))
  @Post('deposit')
  async deposit(@Body() depositDto, @Request() req) {
    return this.transactionService.deposit(depositDto.amount, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(paymentSchema))
  @Post('withdraw')
  async withdraw(@Body() withdrawDto, @Request() req) {
    return this.transactionService.withdraw(withdrawDto.amount, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async getTransaction(
    @Request() req,
    @Query() query: { page: string; limit: string },
  ) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    return this.transactionService.getTransaction({
      userId: req.user.id,
      page,
      limit,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(productSchema))
  @Post('purchase')
  async purchase(@Body() depositDto, @Request() req) {
    return this.transactionService.purchase(depositDto.products, req.user.id);
  }
}
