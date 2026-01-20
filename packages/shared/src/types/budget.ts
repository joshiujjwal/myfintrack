export interface Budget {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  period: BudgetPeriod;
  totalBudgeted: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BudgetItem {
  id: string;
  budgetId: string;
  categoryId: string;
  budgetedAmount: number;
  spentAmount: number;
  rollover: boolean;
  rolloverAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  budgetId: string;
  period: string;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
  items: BudgetItemSummary[];
}

export interface BudgetItemSummary {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetItemStatus;
}

export type BudgetItemStatus = 'under' | 'near' | 'over';

export interface BudgetAlert {
  budgetItemId: string;
  categoryName: string;
  percentUsed: number;
  threshold: number;
  message: string;
}
