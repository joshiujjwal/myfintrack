import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalculationsService } from './calculations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('calculations')
@Controller('calculations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalculationsController {
  constructor(private calculationsService: CalculationsService) {}

  @Post('future-value')
  @ApiOperation({ summary: 'Calculate future value' })
  calculateFutureValue(
    @Body('presentValue') presentValue: number,
    @Body('payment') payment: number,
    @Body('rate') rate: number,
    @Body('periods') periods: number,
  ) {
    const result = this.calculationsService.calculateFutureValue(
      presentValue,
      payment,
      rate,
      periods,
    );
    return { futureValue: result };
  }

  @Post('present-value')
  @ApiOperation({ summary: 'Calculate present value' })
  calculatePresentValue(
    @Body('futureValue') futureValue: number,
    @Body('payment') payment: number,
    @Body('rate') rate: number,
    @Body('periods') periods: number,
  ) {
    const result = this.calculationsService.calculatePresentValue(
      futureValue,
      payment,
      rate,
      periods,
    );
    return { presentValue: result };
  }

  @Post('required-payment')
  @ApiOperation({ summary: 'Calculate required monthly payment' })
  calculateRequiredPayment(
    @Body('targetAmount') targetAmount: number,
    @Body('rate') rate: number,
    @Body('periods') periods: number,
    @Body('presentValue') presentValue?: number,
  ) {
    const result = this.calculationsService.calculateRequiredPayment(
      targetAmount,
      rate,
      periods,
      presentValue || 0,
    );
    return { payment: result };
  }

  @Post('compound-interest')
  @ApiOperation({ summary: 'Calculate compound interest over time' })
  calculateCompoundInterest(
    @Body('principal') principal: number,
    @Body('monthlyContribution') monthlyContribution: number,
    @Body('annualRate') annualRate: number,
    @Body('years') years: number,
  ) {
    return this.calculationsService.calculateCompoundInterest(
      principal,
      monthlyContribution,
      annualRate,
      years,
    );
  }

  @Post('monte-carlo')
  @ApiOperation({ summary: 'Run Monte Carlo simulation' })
  runMonteCarloSimulation(
    @Body('initialAmount') initialAmount: number,
    @Body('monthlyContribution') monthlyContribution: number,
    @Body('years') years: number,
    @Body('meanReturn') meanReturn: number,
    @Body('stdDev') stdDev: number,
    @Body('simulations') simulations?: number,
    @Body('targetAmount') targetAmount?: number,
  ) {
    const result = this.calculationsService.runMonteCarloSimulation(
      initialAmount,
      monthlyContribution,
      years,
      meanReturn,
      stdDev,
      simulations || 1000,
      targetAmount,
    );

    // Return summary without full results array
    return {
      percentiles: result.percentiles,
      successRate: result.successRate,
      mean: result.results.reduce((a, b) => a + b, 0) / result.results.length,
    };
  }

  @Post('financial-health')
  @ApiOperation({ summary: 'Calculate financial health score' })
  calculateFinancialHealth(
    @Body('emergencyFundMonths') emergencyFundMonths: number,
    @Body('debtToIncomeRatio') debtToIncomeRatio: number,
    @Body('savingsRate') savingsRate: number,
    @Body('housingRatio') housingRatio: number,
  ) {
    return this.calculationsService.calculateFinancialHealthScore({
      emergencyFundMonths,
      debtToIncomeRatio,
      savingsRate,
      housingRatio,
    });
  }
}
