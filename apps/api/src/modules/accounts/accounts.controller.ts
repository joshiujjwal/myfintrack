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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'includeHidden', required: false, type: Boolean })
  async findAll(
    @GetUser('sub') userId: string,
    @Query('includeHidden') includeHidden?: boolean,
  ) {
    return this.accountsService.findAll(userId, includeHidden);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get accounts summary' })
  async getSummary(@GetUser('sub') userId: string) {
    return this.accountsService.getSummary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findById(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.accountsService.findById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create manual account' })
  async create(
    @GetUser('sub') userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  async update(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(userId, id, dto);
  }

  @Patch(':id/balance')
  @ApiOperation({ summary: 'Update account balance' })
  async updateBalance(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body('balance') balance: number,
  ) {
    return this.accountsService.updateBalance(userId, id, balance);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  async delete(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.accountsService.delete(userId, id);
    return { message: 'Account deleted' };
  }

  @Get(':id/balance-history')
  @ApiOperation({ summary: 'Get account balance history' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getBalanceHistory(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Query('days') days?: number,
  ) {
    return this.accountsService.getBalanceHistory(userId, id, days || 90);
  }
}
