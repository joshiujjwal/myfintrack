import { Injectable } from '@nestjs/common';

export interface DebtInput {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface DebtPayoffResult {
  debts: DebtPayoffItem[];
  timeline: DebtPayoffTimelinePoint[];
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
}

export interface DebtPayoffItem {
  id: string;
  name: string;
  originalBalance: number;
  interestRate: number;
  payoffMonth: number;
  totalInterestPaid: number;
}

export interface DebtPayoffTimelinePoint {
  month: number;
  date: Date;
  totalBalance: number;
  totalPaid: number;
  totalInterestPaid: number;
  debts: {
    id: string;
    balance: number;
    payment: number;
    interestPaid: number;
  }[];
}

export interface MonteCarloResult {
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  successRate: number;
  results: number[];
}

@Injectable()
export class CalculationsService {
  /**
   * Calculate Future Value (FV)
   * FV = PV * (1 + r)^n + PMT * [(1 + r)^n - 1] / r
   */
  calculateFutureValue(
    presentValue: number,
    payment: number,
    rate: number, // Monthly rate
    periods: number, // Months
  ): number {
    if (rate === 0) {
      return presentValue + payment * periods;
    }

    const factor = Math.pow(1 + rate, periods);
    return presentValue * factor + payment * ((factor - 1) / rate);
  }

  /**
   * Calculate Present Value (PV)
   * PV = FV / (1 + r)^n - PMT * [(1 + r)^n - 1] / [r * (1 + r)^n]
   */
  calculatePresentValue(
    futureValue: number,
    payment: number,
    rate: number,
    periods: number,
  ): number {
    if (rate === 0) {
      return futureValue - payment * periods;
    }

    const factor = Math.pow(1 + rate, periods);
    return futureValue / factor - payment * ((factor - 1) / (rate * factor));
  }

  /**
   * Calculate Required Payment (PMT)
   * PMT = [FV - PV * (1 + r)^n] * r / [(1 + r)^n - 1]
   */
  calculateRequiredPayment(
    targetAmount: number,
    rate: number,
    periods: number,
    presentValue: number = 0,
  ): number {
    if (periods <= 0) return targetAmount;
    if (rate === 0) return (targetAmount - presentValue) / periods;

    const factor = Math.pow(1 + rate, periods);
    return ((targetAmount - presentValue * factor) * rate) / (factor - 1);
  }

  /**
   * Calculate Number of Periods
   * n = ln[(PMT + FV * r) / (PMT + PV * r)] / ln(1 + r)
   */
  calculatePeriods(
    presentValue: number,
    futureValue: number,
    payment: number,
    rate: number,
  ): number {
    if (rate === 0) return (futureValue - presentValue) / payment;

    const numerator = payment + futureValue * rate;
    const denominator = payment + presentValue * rate;

    if (denominator <= 0 || numerator <= 0) {
      return Infinity;
    }

    return Math.log(numerator / denominator) / Math.log(1 + rate);
  }

  /**
   * Calculate compound interest with regular contributions
   */
  calculateCompoundInterest(
    principal: number,
    monthlyContribution: number,
    annualRate: number,
    years: number,
  ): { finalAmount: number; totalContributions: number; totalInterest: number } {
    const monthlyRate = annualRate / 12;
    const months = years * 12;

    const finalAmount = this.calculateFutureValue(
      principal,
      monthlyContribution,
      monthlyRate,
      months,
    );

    const totalContributions = principal + monthlyContribution * months;
    const totalInterest = finalAmount - totalContributions;

    return {
      finalAmount,
      totalContributions,
      totalInterest,
    };
  }

  /**
   * Calculate debt payoff timeline
   */
  calculateDebtPayoff(debts: DebtInput[], extraPayment: number = 0): DebtPayoffResult {
    if (debts.length === 0) {
      return { debts: [], timeline: [], totalMonths: 0, totalInterest: 0, totalPaid: 0 };
    }

    // Create working copy
    const workingDebts = debts.map((d) => ({
      ...d,
      currentBalance: d.balance,
      totalInterestPaid: 0,
      isPaidOff: false,
      payoffMonth: 0,
    }));

    const timeline: DebtPayoffTimelinePoint[] = [];
    let month = 0;
    let totalInterestPaid = 0;
    let totalPaid = 0;
    const minPaymentTotal = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    while (workingDebts.some((d) => !d.isPaidOff)) {
      month++;
      const now = new Date();
      now.setMonth(now.getMonth() + month);

      let availableExtra = extraPayment;
      const timelinePoint: DebtPayoffTimelinePoint = {
        month,
        date: now,
        totalBalance: 0,
        totalPaid: 0,
        totalInterestPaid: 0,
        debts: [],
      };

      // Apply minimum payments and interest
      for (const debt of workingDebts) {
        if (debt.isPaidOff) continue;

        // Calculate monthly interest
        const monthlyRate = debt.interestRate / 12;
        const interestCharge = debt.currentBalance * monthlyRate;
        debt.currentBalance += interestCharge;
        debt.totalInterestPaid += interestCharge;
        totalInterestPaid += interestCharge;

        // Apply minimum payment
        const payment = Math.min(debt.minimumPayment, debt.currentBalance);
        debt.currentBalance -= payment;
        totalPaid += payment;

        timelinePoint.debts.push({
          id: debt.id,
          balance: debt.currentBalance,
          payment,
          interestPaid: interestCharge,
        });

        if (debt.currentBalance <= 0.01) {
          debt.isPaidOff = true;
          debt.payoffMonth = month;
          debt.currentBalance = 0;
          // Add freed minimum payment to extra
          availableExtra += debt.minimumPayment;
        }
      }

      // Apply extra payment to first non-paid-off debt (already sorted by priority)
      for (const debt of workingDebts) {
        if (debt.isPaidOff || availableExtra <= 0) continue;

        const extraApplied = Math.min(availableExtra, debt.currentBalance);
        debt.currentBalance -= extraApplied;
        totalPaid += extraApplied;

        // Update timeline point
        const debtPoint = timelinePoint.debts.find((d) => d.id === debt.id);
        if (debtPoint) {
          debtPoint.payment += extraApplied;
          debtPoint.balance = debt.currentBalance;
        }

        availableExtra -= extraApplied;

        if (debt.currentBalance <= 0.01) {
          debt.isPaidOff = true;
          debt.payoffMonth = month;
          debt.currentBalance = 0;
          availableExtra += debt.minimumPayment;
        }
      }

      timelinePoint.totalBalance = workingDebts.reduce((sum, d) => sum + d.currentBalance, 0);
      timelinePoint.totalPaid = totalPaid;
      timelinePoint.totalInterestPaid = totalInterestPaid;
      timeline.push(timelinePoint);

      // Safety check to prevent infinite loop
      if (month > 600) break; // 50 years max
    }

    return {
      debts: workingDebts.map((d) => ({
        id: d.id,
        name: d.name,
        originalBalance: d.balance,
        interestRate: d.interestRate,
        payoffMonth: d.payoffMonth,
        totalInterestPaid: d.totalInterestPaid,
      })),
      timeline,
      totalMonths: month,
      totalInterest: totalInterestPaid,
      totalPaid,
    };
  }

  /**
   * Monte Carlo simulation for investment projections
   */
  runMonteCarloSimulation(
    initialAmount: number,
    monthlyContribution: number,
    years: number,
    meanReturn: number, // Annual
    stdDev: number, // Annual
    simulations: number = 1000,
    targetAmount?: number,
  ): MonteCarloResult {
    const results: number[] = [];
    let successCount = 0;
    const months = years * 12;

    for (let i = 0; i < simulations; i++) {
      let balance = initialAmount;

      for (let month = 0; month < months; month++) {
        // Generate random monthly return using Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        // Convert annual mean and stdDev to monthly
        const monthlyMean = meanReturn / 12;
        const monthlyStdDev = stdDev / Math.sqrt(12);
        const monthlyReturn = monthlyMean + monthlyStdDev * z;

        balance = balance * (1 + monthlyReturn) + monthlyContribution;
      }

      results.push(balance);
      if (targetAmount && balance >= targetAmount) {
        successCount++;
      }
    }

    // Sort results for percentile calculation
    results.sort((a, b) => a - b);

    const getPercentile = (p: number) => results[Math.floor(results.length * p)];

    return {
      percentiles: {
        p10: getPercentile(0.1),
        p25: getPercentile(0.25),
        p50: getPercentile(0.5),
        p75: getPercentile(0.75),
        p90: getPercentile(0.9),
      },
      successRate: targetAmount ? successCount / simulations : 1,
      results,
    };
  }

  /**
   * Calculate financial health score (0-100)
   */
  calculateFinancialHealthScore(metrics: {
    emergencyFundMonths: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    housingRatio: number;
  }): { score: number; breakdown: Record<string, number> } {
    // Emergency fund (25 points)
    let emergencyScore = 0;
    if (metrics.emergencyFundMonths >= 6) emergencyScore = 25;
    else if (metrics.emergencyFundMonths >= 3) emergencyScore = 20;
    else emergencyScore = (metrics.emergencyFundMonths / 3) * 15;

    // Debt-to-income ratio (25 points) - target < 36%
    let debtScore = 0;
    if (metrics.debtToIncomeRatio <= 0.15) debtScore = 25;
    else if (metrics.debtToIncomeRatio <= 0.36) debtScore = 20;
    else if (metrics.debtToIncomeRatio <= 0.5) debtScore = 10;
    else debtScore = 0;

    // Savings rate (30 points) - target 10-20%
    let savingsScore = 0;
    if (metrics.savingsRate >= 0.2) savingsScore = 30;
    else if (metrics.savingsRate >= 0.15) savingsScore = 25;
    else if (metrics.savingsRate >= 0.1) savingsScore = 20;
    else savingsScore = metrics.savingsRate * 150;

    // Housing ratio (20 points) - target < 28%
    let housingScore = 0;
    if (metrics.housingRatio <= 0.2) housingScore = 20;
    else if (metrics.housingRatio <= 0.28) housingScore = 15;
    else if (metrics.housingRatio <= 0.36) housingScore = 10;
    else housingScore = 0;

    const totalScore = Math.round(emergencyScore + debtScore + savingsScore + housingScore);

    return {
      score: Math.min(100, totalScore),
      breakdown: {
        emergencyFund: emergencyScore,
        debtToIncome: debtScore,
        savingsRate: savingsScore,
        housingRatio: housingScore,
      },
    };
  }
}
