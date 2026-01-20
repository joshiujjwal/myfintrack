export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  plaidTransactionId?: string;
  amount: number; // Positive = expense, Negative = income
  date: Date;
  name: string;
  merchantName?: string;
  categoryId?: string;
  pending: boolean;
  type: TransactionType;
  paymentChannel?: PaymentChannel;
  location?: TransactionLocation;
  tags: string[];
  notes?: string;
  isRecurring: boolean;
  recurringRuleId?: string;
  isExcludedFromBudget: boolean;
  isExcludedFromReports: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'debit' | 'credit' | 'transfer';

export type PaymentChannel = 'online' | 'in_store' | 'other';

export interface TransactionLocation {
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: Date;
}

export type CategoryType = 'income' | 'expense' | 'transfer';

export interface RecurringRule {
  id: string;
  userId: string;
  name: string;
  merchantPattern?: string;
  categoryId?: string;
  averageAmount: number;
  frequency: RecurringFrequency;
  lastOccurrence?: Date;
  nextExpected?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RecurringFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'annually';

export interface TransactionFilter {
  accountIds?: string[];
  categoryIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  search?: string;
  tags?: string[];
  isRecurring?: boolean;
  isPending?: boolean;
  type?: TransactionType;
}

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingTrend {
  period: string;
  income: number;
  expenses: number;
  savings: number;
}
