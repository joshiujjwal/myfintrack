import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters' })
  async findAll(
    @GetUser('sub') userId: string,
    @Query() filter: TransactionFilterDto,
  ) {
    return this.transactionsService.findAll(userId, filter);
  }

  @Get('spending-by-category')
  @ApiOperation({ summary: 'Get spending breakdown by category' })
  async getSpendingByCategory(
    @GetUser('sub') userId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.transactionsService.getSpendingByCategory(
      userId,
      startDate || new Date(new Date().setDate(1)),
      endDate || new Date(),
    );
  }

  @Get('spending-trend')
  @ApiOperation({ summary: 'Get spending trend over time' })
  async getSpendingTrend(
    @GetUser('sub') userId: string,
    @Query('months') months?: number,
  ) {
    return this.transactionsService.getSpendingTrend(userId, months || 6);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async findById(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.transactionsService.findById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  async create(
    @GetUser('sub') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  async update(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  async delete(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.transactionsService.delete(userId, id);
    return { message: 'Transaction deleted' };
  }
}
