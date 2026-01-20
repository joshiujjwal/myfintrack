export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  retirementAge?: number;
  riskTolerance?: RiskTolerance;
  annualIncome?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface UserSettings {
  id: string;
  userId: string;
  currency: string;
  locale: string;
  dashboardLayout?: DashboardLayout;
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType =
  | 'net_worth'
  | 'cash_flow'
  | 'goal_progress'
  | 'spending_breakdown'
  | 'account_balances'
  | 'alerts'
  | 'quick_actions'
  | 'debt_overview'
  | 'budget_status'
  | 'recent_transactions';
