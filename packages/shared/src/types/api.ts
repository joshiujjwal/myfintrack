// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: Required<ApiMeta>;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Plaid Types
export interface PlaidLinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface PlaidExchangeRequest {
  publicToken: string;
  institutionId?: string;
  institutionName?: string;
}

// WebSocket Events
export type WebSocketEvent =
  | 'account:updated'
  | 'transaction:synced'
  | 'balance:updated'
  | 'goal:progress'
  | 'alert:created'
  | 'sync:started'
  | 'sync:completed'
  | 'sync:error';

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvent;
  data: T;
  timestamp: Date;
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type AlertType =
  | 'budget_exceeded'
  | 'goal_milestone'
  | 'goal_at_risk'
  | 'large_transaction'
  | 'recurring_detected'
  | 'low_balance'
  | 'sync_error'
  | 'bill_due';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';
