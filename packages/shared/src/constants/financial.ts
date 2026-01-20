// CFP Best Practice Constants

// Emergency Fund
export const EMERGENCY_FUND_MONTHS_MIN = 3;
export const EMERGENCY_FUND_MONTHS_MAX = 6;
export const EMERGENCY_FUND_MONTHS_DEFAULT = 6;

// Debt Ratios
export const DEBT_TO_INCOME_TARGET = 0.36; // 36%
export const HOUSING_RATIO_TARGET = 0.28; // 28%

// Savings
export const SAVINGS_RATE_MIN = 0.10; // 10%
export const SAVINGS_RATE_MAX = 0.20; // 20%
export const SAVINGS_RATE_TARGET = 0.15; // 15%

// Retirement
export const SAFE_WITHDRAWAL_RATE = 0.04; // 4%
export const DEFAULT_RETIREMENT_AGE = 65;
export const DEFAULT_LIFE_EXPECTANCY = 95;
export const DEFAULT_INFLATION_RATE = 0.03; // 3%

// Investment Returns (Historical averages)
export const STOCK_RETURN_MEAN = 0.10; // 10%
export const STOCK_RETURN_STD_DEV = 0.18; // 18%
export const BOND_RETURN_MEAN = 0.05; // 5%
export const BOND_RETURN_STD_DEV = 0.06; // 6%
export const BALANCED_RETURN_MEAN = 0.07; // 7%
export const BALANCED_RETURN_STD_DEV = 0.12; // 12%

// Risk Tolerance Returns
export const RISK_TOLERANCE_RETURNS = {
  conservative: { mean: 0.05, stdDev: 0.06 },
  moderate: { mean: 0.07, stdDev: 0.12 },
  aggressive: { mean: 0.10, stdDev: 0.18 },
} as const;

// Monte Carlo
export const DEFAULT_MONTE_CARLO_SIMULATIONS = 1000;

// Credit Score Ranges
export const CREDIT_SCORE_RANGES = {
  excellent: { min: 800, max: 850 },
  veryGood: { min: 740, max: 799 },
  good: { min: 670, max: 739 },
  fair: { min: 580, max: 669 },
  poor: { min: 300, max: 579 },
} as const;

// Financial Health Score Weights
export const HEALTH_SCORE_WEIGHTS = {
  emergencyFund: 0.25,
  debtToIncome: 0.25,
  savingsRate: 0.20,
  housingRatio: 0.15,
  investmentDiversity: 0.15,
} as const;

// Budget Alert Thresholds
export const BUDGET_ALERT_WARNING = 0.80; // 80%
export const BUDGET_ALERT_DANGER = 0.95; // 95%

// Large Transaction Threshold
export const LARGE_TRANSACTION_THRESHOLD = 500;

// Low Balance Alert
export const LOW_BALANCE_THRESHOLD = 100;
