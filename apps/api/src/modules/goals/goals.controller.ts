import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  async findAll(@GetUser('sub') userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  async findById(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalsService.findById(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  async create(
    @GetUser('sub') userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal' })
  async update(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.goalsService.delete(userId, id);
    return { message: 'Goal deleted' };
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Add contribution to goal' })
  async addContribution(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('notes') notes?: string,
  ) {
    return this.goalsService.addContribution(userId, id, amount, notes);
  }

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Add milestone to goal' })
  async addMilestone(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('targetAmount') targetAmount: number,
    @Body('targetDate') targetDate?: Date,
  ) {
    return this.goalsService.addMilestone(userId, id, name, targetAmount, targetDate);
  }
}
