export interface Account {
  id: string;
  userId: string;
  plaidAccountId?: string;
  plaidItemId?: string;
  name: string;
  officialName?: string;
  type: AccountType;
  subtype?: string;
  mask?: string;
  institutionName?: string;
  institutionId?: string;
  currentBalance: number;
  availableBalance?: number;
  creditLimit?: number;
  currency: string;
  isManual: boolean;
  isHidden: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'loan'
  | 'investment'
  | 'mortgage'
  | 'other';

export interface PlaidItem {
  id: string;
  userId: string;
  accessToken: string; // Encrypted
  itemId: string;
  institutionId?: string;
  institutionName?: string;
  consentExpiresAt?: Date;
  lastSyncedAt?: Date;
  syncStatus: PlaidSyncStatus;
  errorCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PlaidSyncStatus = 'active' | 'pending' | 'error' | 'disconnected';

export interface BalanceHistory {
  id: string;
  accountId: string;
  balance: number;
  date: Date;
  createdAt: Date;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  date: Date;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: NetWorthBreakdown;
  createdAt: Date;
}

export interface NetWorthBreakdown {
  cash: number;
  investments: number;
  property: number;
  otherAssets: number;
  creditCards: number;
  loans: number;
  mortgages: number;
  otherLiabilities: number;
}
