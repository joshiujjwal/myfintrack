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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @GetUser('sub') userId: string,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.budgetsService.findAll(userId, activeOnly !== false);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active budget' })
  async getCurrentBudget(@GetUser('sub') userId: string) {
    return this.budgetsService.getCurrentBudget(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary with spending' })
  @ApiQuery({ name: 'budgetId', required: false })
  async getBudgetSummary(
    @GetUser('sub') userId: string,
    @Query('budgetId') budgetId?: string,
  ) {
    return this.budgetsService.getBudgetSummary(userId, budgetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  async findById(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.budgetsService.findById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create budget' })
  async create(
    @GetUser('sub') userId: string,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget' })
  async update(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  async delete(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.budgetsService.delete(userId, id);
    return { message: 'Budget deleted' };
  }
}
