export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  priority: number;
  status: GoalStatus;
  linkedAccountIds: string[];
  monthlyContribution?: number;
  expectedReturn?: number; // Annual percentage
  inflationRate?: number;
  icon?: string;
  color?: string;
  settings: GoalSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalType =
  | 'emergency_fund'
  | 'debt_free'
  | 'retirement'
  | 'home_purchase'
  | 'education'
  | 'vacation'
  | 'major_purchase'
  | 'investment'
  | 'custom';

export type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'paused';

export interface GoalSettings {
  // Emergency Fund specific
  monthsOfExpenses?: number;

  // Retirement specific
  withdrawalRate?: number;
  socialSecurityEstimate?: number;

  // Home purchase specific
  downPaymentPercent?: number;
  homePrice?: number;

  // Education specific
  yearsUntilNeeded?: number;
  inflationAdjusted?: boolean;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  name: string;
  targetAmount: number;
  targetDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  source?: string;
  notes?: string;
  createdAt: Date;
}

export interface GoalProjection {
  goalId: string;
  currentAmount: number;
  targetAmount: number;
  projectedAmount: number;
  projectedDate: Date;
  onTrack: boolean;
  shortfall: number;
  requiredMonthlyContribution: number;
  percentComplete: number;
  daysRemaining: number;
  projectionData: GoalProjectionDataPoint[];
}

export interface GoalProjectionDataPoint {
  date: Date;
  projected: number;
  actual?: number;
  target: number;
}

export interface GoalImpactAnalysis {
  goalId: string;
  currentProjectedDate: Date;
  scenarios: ImpactScenario[];
}

export interface ImpactScenario {
  name: string;
  description: string;
  monthlyChange: number;
  newProjectedDate: Date;
  daysDifference: number;
}
