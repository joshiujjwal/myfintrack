export interface Debt {
  id: string;
  userId: string;
  linkedAccountId?: string;
  name: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
  interestRate: number; // Annual percentage
  minimumPayment: number;
  dueDay: number; // Day of month
  startDate: Date;
  payoffDate?: Date;
  lender?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DebtType =
  | 'credit_card'
  | 'student_loan'
  | 'auto_loan'
  | 'mortgage'
  | 'personal_loan'
  | 'medical'
  | 'other';

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  date: Date;
  createdAt: Date;
}

export type DebtPayoffStrategy = 'avalanche' | 'snowball';

export interface DebtPayoffPlan {
  strategy: DebtPayoffStrategy;
  debts: DebtPayoffItem[];
  totalMonths: number;
  totalInterestPaid: number;
  monthlyPayment: number;
  payoffDate: Date;
  timeline: DebtPayoffTimelinePoint[];
}

export interface DebtPayoffItem {
  debtId: string;
  debtName: string;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  payoffOrder: number;
  payoffDate: Date;
  totalInterestPaid: number;
  monthsToPayoff: number;
}

export interface DebtPayoffTimelinePoint {
  month: number;
  date: Date;
  totalBalance: number;
  totalPaid: number;
  totalInterestPaid: number;
  debts: {
    debtId: string;
    balance: number;
    payment: number;
    interestPaid: number;
  }[];
}

export interface DebtComparison {
  avalanche: DebtPayoffPlan;
  snowball: DebtPayoffPlan;
  interestSaved: number;
  timeSavedMonths: number;
}
