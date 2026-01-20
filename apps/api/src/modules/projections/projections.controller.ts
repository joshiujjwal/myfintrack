import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectionsService } from './projections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('projections')
@Controller('projections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectionsController {
  constructor(private projectionsService: ProjectionsService) {}

  @Get('net-worth')
  @ApiOperation({ summary: 'Get net worth projection' })
  @ApiQuery({ name: 'years', required: false, type: Number })
  @ApiQuery({ name: 'monthlyContribution', required: false, type: Number })
  @ApiQuery({ name: 'annualReturn', required: false, type: Number })
  async getNetWorthProjection(
    @GetUser('sub') userId: string,
    @Query('years') years?: number,
    @Query('monthlyContribution') monthlyContribution?: number,
    @Query('annualReturn') annualReturn?: number,
  ) {
    return this.projectionsService.getNetWorthProjection(
      userId,
      years || 10,
      monthlyContribution || 0,
      annualReturn || 0.07,
    );
  }

  @Post('retirement')
  @ApiOperation({ summary: 'Get retirement projection' })
  async getRetirementProjection(
    @GetUser('sub') userId: string,
    @Body()
    params: {
      currentAge?: number;
      retirementAge?: number;
      lifeExpectancy?: number;
      monthlyExpenses?: number;
      currentSavings?: number;
      monthlyContribution?: number;
      socialSecurity?: number;
      annualReturn?: number;
      inflationRate?: number;
    },
  ) {
    return this.projectionsService.getRetirementProjection(userId, params);
  }

  @Get('financial-health')
  @ApiOperation({ summary: 'Get financial health score and metrics' })
  async getFinancialHealth(@GetUser('sub') userId: string) {
    return this.projectionsService.getFinancialHealth(userId);
  }
}
