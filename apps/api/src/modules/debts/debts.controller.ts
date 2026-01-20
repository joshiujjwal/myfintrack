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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('debts')
@Controller('debts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DebtsController {
  constructor(private debtsService: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all debts' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @GetUser('sub') userId: string,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.debtsService.findAll(userId, activeOnly !== false);
  }

  @Get('payoff-plan')
  @ApiOperation({ summary: 'Get debt payoff plan' })
  @ApiQuery({ name: 'strategy', required: false, enum: ['avalanche', 'snowball'] })
  @ApiQuery({ name: 'extraPayment', required: false, type: Number })
  async getPayoffPlan(
    @GetUser('sub') userId: string,
    @Query('strategy') strategy: 'avalanche' | 'snowball' = 'avalanche',
    @Query('extraPayment') extraPayment?: number,
  ) {
    return this.debtsService.getPayoffPlan(userId, strategy, extraPayment || 0);
  }

  @Get('compare-strategies')
  @ApiOperation({ summary: 'Compare avalanche vs snowball strategies' })
  @ApiQuery({ name: 'extraPayment', required: false, type: Number })
  async compareStrategies(
    @GetUser('sub') userId: string,
    @Query('extraPayment') extraPayment?: number,
  ) {
    return this.debtsService.compareStrategies(userId, extraPayment || 0);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  async findById(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.debtsService.findById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create debt' })
  async create(
    @GetUser('sub') userId: string,
    @Body() dto: CreateDebtDto,
  ) {
    return this.debtsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update debt' })
  async update(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debt' })
  async delete(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.debtsService.delete(userId, id);
    return { message: 'Debt deleted' };
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Add payment to debt' })
  async addPayment(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('date') date?: Date,
  ) {
    return this.debtsService.addPayment(userId, id, amount, date);
  }
}
