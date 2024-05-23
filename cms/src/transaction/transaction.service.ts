import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { TransactionDto } from './dto/transaction.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async deposit(amount: number, userId: string) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount,
            type: 'DEPOSIT',
          },
        });

        const user = await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } },
        });

        return { transaction, user: this.userService.responseUser(user) };
      });

      return {
        transaction: result.transaction,
        user: result.user,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        return {
          statusCode: error.getStatus(),
          message: error.getResponse()['error'],
        };
      }
    }
  }

  async withdraw(amount: number, userId: string) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        });

        if (!user || user.balance < amount) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Insufficient balance',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount,
            type: 'WITHDRAW',
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } },
        });

        return { transaction };
      });

      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      return {
        transaction: result.transaction,
        user: this.userService.responseUser(updatedUser),
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        return {
          statusCode: error.getStatus(),
          message: error.getResponse()['error'],
        };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        };
      }
    }
  }

  async getTransaction(transaction: TransactionDto) {
    try {
      const result = await this.prisma.transaction.findMany({
        where: { userId: transaction.userId },
        take: transaction.limit,
        skip: transaction.limit * (transaction.page - 1),
        orderBy: { createdAt: "desc"},
        include: { Order: true}
      });
      const totalCount = await this.prisma.transaction.count({
        where: { userId: transaction.userId },
      });
      const totalPages = Math.ceil(totalCount / transaction.limit);

      return {
        result,
        totalPages,
        totalCount,
        currentPage: transaction.page,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        return {
          statusCode: error.getStatus(),
          message: error.getResponse()['error'],
        };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        };
      }
    }
  }

  async purchase(products: ProductDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
  
      const totalPrice = products.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);
  
      if (!user || user.balance < totalPrice) {
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: 'Insufficient balance',
        }, HttpStatus.BAD_REQUEST);
      }
  
      const createOrder = {
        amount: totalPrice,
        userId,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          quantity: product.quantity,
          price: product.price,
        })),
      };
  
      const result = await this.prisma.$transaction(async (prisma) => {
        const [transaction] = await Promise.all([
          prisma.transaction.create({
            data: {
              userId,
              amount: totalPrice,
              type: 'PURCHASE',
              Order: { create: [createOrder] },
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { balance: { decrement: totalPrice } },
          }),
        ]);
        
        return { transaction };
      });
  
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      return {
        transaction: result.transaction,
        user: this.userService.responseUser(updatedUser),
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        return {
          statusCode: error.getStatus(),
          message: error.getResponse()['error'],
        };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        };
      }
    }
  }
  
}
