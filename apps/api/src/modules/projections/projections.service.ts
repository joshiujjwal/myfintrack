import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculationsService } from '../calculations/calculations.service';
import {
  SAFE_WITHDRAWAL_RATE,
  DEFAULT_INFLATION_RATE,
  RISK_TOLERANCE_RETURNS,
} from '@myfintrack/shared';

@Injectable()
export class ProjectionsService {
  constructor(
    private prisma: PrismaService,
    private calculations: CalculationsService,
  ) {}

  async getNetWorthProjection(
    userId: string,
    years: number = 10,
    monthlyContribution: number = 0,
    annualReturn: number = 0.07,
  ) {
    // Get current net worth
    const accounts = await this.prisma.account.findMany({
      where: { userId, isHidden: false },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const account of accounts) {
      const balance = Number(account.currentBalance);
      if (['checking', 'savings', 'investment'].includes(account.type)) {
        totalAssets += balance;
      } else if (['credit', 'loan', 'mortgage'].includes(account.type)) {
        totalLiabilities += Math.abs(balance);
      }
    }

    const currentNetWorth = totalAssets - totalLiabilities;

    // Generate projection data points
    const dataPoints = [];
    const monthlyRate = annualReturn / 12;
    const months = years * 12;

    for (let month = 0; month <= months; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() + month);

      const projectedValue = this.calculations.calculateFutureValue(
        currentNetWorth,
        monthlyContribution,
        monthlyRate,
        month,
      );

      dataPoints.push({
        date,
        value: projectedValue,
        month,
      });
    }

    return {
      currentNetWorth,
      projectedNetWorth: dataPoints[dataPoints.length - 1].value,
      totalContributions: monthlyContribution * months,
      dataPoints,
      assumptions: {
        annualReturn,
        monthlyContribution,
        years,
      },
    };
  }

  async getRetirementProjection(
    userId: string,
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
    } = {},
  ) {
    // Get user settings for defaults
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        dateOfBirth: true,
        retirementAge: true,
        riskTolerance: true,
        annualIncome: true,
      },
    });

    // Calculate current age
    const currentAge =
      params.currentAge ||
      (user?.dateOfBirth
        ? Math.floor(
            (Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          )
        : 30);

    const retirementAge = params.retirementAge || user?.retirementAge || 65;
    const lifeExpectancy = params.lifeExpectancy || 95;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const yearsInRetirement = lifeExpectancy - retirementAge;

    // Get current investment balance
    const investmentAccounts = await this.prisma.account.findMany({
      where: { userId, type: 'investment', isHidden: false },
    });
    const currentSavings =
      params.currentSavings ||
      investmentAccounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);

    // Use risk tolerance for return estimates
    const riskProfile = user?.riskTolerance || 'moderate';
    const returnParams = RISK_TOLERANCE_RETURNS[riskProfile];
    const annualReturn = params.annualReturn || returnParams.mean;
    const inflationRate = params.inflationRate || DEFAULT_INFLATION_RATE;

    const monthlyExpenses = params.monthlyExpenses || 5000;
    const monthlyContribution = params.monthlyContribution || 1000;
    const socialSecurity = params.socialSecurity || 2000;

    // Calculate retirement nest egg needed
    const annualExpenses = monthlyExpenses * 12;
    const inflationAdjustedExpenses =
      annualExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
    const neededAtRetirement = inflationAdjustedExpenses / SAFE_WITHDRAWAL_RATE;

    // Project savings at retirement
    const projectedAtRetirement = this.calculations.calculateFutureValue(
      currentSavings,
      monthlyContribution,
      annualReturn / 12,
      yearsToRetirement * 12,
    );

    // Run Monte Carlo for probability of success
    const monteCarlo = this.calculations.runMonteCarloSimulation(
      currentSavings,
      monthlyContribution,
      yearsToRetirement,
      annualReturn,
      returnParams.stdDev,
      1000,
      neededAtRetirement,
    );

    // Calculate shortfall/surplus
    const shortfall = neededAtRetirement - projectedAtRetirement;
    const additionalMonthlyNeeded =
      shortfall > 0
        ? this.calculations.calculateRequiredPayment(
            shortfall,
            annualReturn / 12,
            yearsToRetirement * 12,
          )
        : 0;

    return {
      currentAge,
      retirementAge,
      yearsToRetirement,
      yearsInRetirement,
      lifeExpectancy,
      currentSavings,
      monthlyContribution,
      neededAtRetirement,
      projectedAtRetirement,
      shortfall: Math.max(0, shortfall),
      surplus: Math.max(0, -shortfall),
      successProbability: monteCarlo.successRate,
      additionalMonthlyNeeded,
      monthlyIncomeAtRetirement: projectedAtRetirement * SAFE_WITHDRAWAL_RATE / 12,
      socialSecurityMonthly: socialSecurity,
      totalMonthlyIncome: (projectedAtRetirement * SAFE_WITHDRAWAL_RATE / 12) + socialSecurity,
      percentiles: monteCarlo.percentiles,
      assumptions: {
        annualReturn,
        inflationRate,
        withdrawalRate: SAFE_WITHDRAWAL_RATE,
        riskTolerance: riskProfile,
      },
    };
  }

  async getFinancialHealth(userId: string) {
    const [accounts, transactions, debts, user] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, isHidden: false },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) },
          isExcludedFromReports: false,
        },
      }),
      this.prisma.debt.findMany({
        where: { userId, isActive: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { annualIncome: true },
      }),
    ]);

    // Calculate metrics
    const cashAccounts = accounts.filter((a) =>
      ['checking', 'savings'].includes(a.type),
    );
    const totalLiquid = cashAccounts.reduce(
      (sum, a) => sum + Number(a.currentBalance),
      0,
    );

    // Calculate average monthly expenses
    const expenses = transactions.filter((t) => Number(t.amount) > 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgMonthlyExpenses = totalExpenses / 3;

    // Emergency fund ratio
    const emergencyFundMonths =
      avgMonthlyExpenses > 0 ? totalLiquid / avgMonthlyExpenses : 6;

    // Income
    const monthlyIncome = user?.annualIncome
      ? Number(user.annualIncome) / 12
      : 8000;

    // Total debt payments
    const totalDebtPayments = debts.reduce(
      (sum, d) => sum + Number(d.minimumPayment),
      0,
    );

    // Debt-to-income ratio
    const debtToIncomeRatio = monthlyIncome > 0 ? totalDebtPayments / monthlyIncome : 0;

    // Housing expense (estimate from transactions or debts)
    const housingDebts = debts.filter((d) => d.type === 'mortgage');
    const housingPayment = housingDebts.reduce(
      (sum, d) => sum + Number(d.minimumPayment),
      0,
    );
    const housingRatio = monthlyIncome > 0 ? housingPayment / monthlyIncome : 0;

    // Savings rate
    const income = transactions.filter((t) => Number(t.amount) < 0);
    const totalIncome = Math.abs(
      income.reduce((sum, t) => sum + Number(t.amount), 0),
    );
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;

    const healthScore = this.calculations.calculateFinancialHealthScore({
      emergencyFundMonths,
      debtToIncomeRatio,
      savingsRate: Math.max(0, savingsRate),
      housingRatio,
    });

    return {
      ...healthScore,
      metrics: {
        emergencyFundMonths: {
          value: emergencyFundMonths,
          target: 6,
          status: this.getStatus(emergencyFundMonths, 6, 3),
        },
        debtToIncomeRatio: {
          value: debtToIncomeRatio,
          target: 0.36,
          status: this.getStatus(0.36 - debtToIncomeRatio, 0, -0.15),
        },
        savingsRate: {
          value: savingsRate,
          target: 0.2,
          status: this.getStatus(savingsRate, 0.2, 0.1),
        },
        housingRatio: {
          value: housingRatio,
          target: 0.28,
          status: this.getStatus(0.28 - housingRatio, 0, -0.08),
        },
      },
      recommendations: this.getRecommendations(
        emergencyFundMonths,
        debtToIncomeRatio,
        savingsRate,
        housingRatio,
      ),
    };
  }

  private getStatus(
    value: number,
    excellent: number,
    good: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (value >= excellent) return 'excellent';
    if (value >= good) return 'good';
    if (value >= good * 0.5) return 'fair';
    return 'poor';
  }

  private getRecommendations(
    emergencyFundMonths: number,
    debtToIncomeRatio: number,
    savingsRate: number,
    housingRatio: number,
  ): Array<{ priority: string; category: string; title: string; description: string }> {
    const recommendations = [];

    if (emergencyFundMonths < 3) {
      recommendations.push({
        priority: 'high',
        category: 'Emergency Fund',
        title: 'Build your emergency fund',
        description: `You have ${emergencyFundMonths.toFixed(1)} months of expenses saved. Aim for at least 3-6 months.`,
      });
    }

    if (debtToIncomeRatio > 0.36) {
      recommendations.push({
        priority: 'high',
        category: 'Debt Management',
        title: 'Reduce your debt-to-income ratio',
        description: `Your ratio of ${(debtToIncomeRatio * 100).toFixed(1)}% exceeds the recommended 36%. Focus on paying down debt.`,
      });
    }

    if (savingsRate < 0.1) {
      recommendations.push({
        priority: 'medium',
        category: 'Savings',
        title: 'Increase your savings rate',
        description: `You're saving ${(savingsRate * 100).toFixed(1)}% of income. Try to reach at least 10-20%.`,
      });
    }

    if (housingRatio > 0.28) {
      recommendations.push({
        priority: 'medium',
        category: 'Housing',
        title: 'Review housing costs',
        description: `Housing takes ${(housingRatio * 100).toFixed(1)}% of income. Consider reducing to under 28%.`,
      });
    }

    return recommendations;
  }
}
