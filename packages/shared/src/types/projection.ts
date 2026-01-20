export interface Projection {
  id: string;
  userId: string;
  type: ProjectionType;
  name: string;
  parameters: ProjectionParameters;
  result: ProjectionResult;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectionType =
  | 'compound_interest'
  | 'retirement'
  | 'debt_payoff'
  | 'goal_progress'
  | 'net_worth'
  | 'monte_carlo';

export interface ProjectionParameters {
  // Common
  startDate: Date;
  endDate: Date;
  initialAmount?: number;

  // Compound Interest
  monthlyContribution?: number;
  annualReturn?: number;
  inflationRate?: number;

  // Retirement
  currentAge?: number;
  retirementAge?: number;
  lifeExpectancy?: number;
  annualExpenses?: number;
  socialSecurity?: number;
  withdrawalRate?: number;

  // Monte Carlo
  simulations?: number;
  returnMean?: number;
  returnStdDev?: number;
}

export interface ProjectionResult {
  finalAmount: number;
  totalContributions: number;
  totalInterestEarned: number;
  inflationAdjustedAmount?: number;
  dataPoints: ProjectionDataPoint[];

  // Monte Carlo specific
  percentiles?: MonteCarloPercentiles;
  successRate?: number;
}

export interface ProjectionDataPoint {
  date: Date;
  value: number;
  contributions?: number;
  interest?: number;
}

export interface MonteCarloPercentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface Scenario {
  id: string;
  userId: string;
  name: string;
  description?: string;
  baselineType: ScenarioBaselineType;
  adjustments: ScenarioAdjustment[];
  result?: ScenarioResult;
  createdAt: Date;
  updatedAt: Date;
}

export type ScenarioBaselineType = 'current' | 'goal' | 'custom';

export interface ScenarioAdjustment {
  type: AdjustmentType;
  category?: string;
  amount: number;
  frequency: 'one_time' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
}

export type AdjustmentType =
  | 'income_change'
  | 'expense_change'
  | 'savings_change'
  | 'investment_return'
  | 'debt_payment';

export interface ScenarioResult {
  impactOnNetWorth: number;
  impactOnGoals: GoalImpact[];
  impactOnDebtPayoff: number;
  cashFlowDifference: number;
}

export interface GoalImpact {
  goalId: string;
  goalName: string;
  originalDate: Date;
  newDate: Date;
  daysDifference: number;
}

// Financial Health Metrics (CFP Ratios)
export interface FinancialHealth {
  userId: string;
  calculatedAt: Date;
  overallScore: number; // 0-100
  metrics: FinancialMetrics;
  recommendations: HealthRecommendation[];
}

export interface FinancialMetrics {
  emergencyFundRatio: MetricValue; // Target: 3-6 months
  debtToIncomeRatio: MetricValue; // Target: <36%
  housingRatio: MetricValue; // Target: <28%
  savingsRatio: MetricValue; // Target: 10-20%
  investmentRatio: MetricValue;
  liquidityRatio: MetricValue;
}

export interface MetricValue {
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  percentOfTarget: number;
}

export interface HealthRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
}
