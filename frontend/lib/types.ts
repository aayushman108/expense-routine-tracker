// ═══════════════════════════════════════════════════
// TYPES — mirrors the DB schema
// ═══════════════════════════════════════════════════

export interface User {
  id: string;
  full_name: string;
  nickname?: string;
  email: string;
  phone?: string;
  avatar?: { url: string; publicId: string } | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: { url: string; publicId: string } | null;
  created_by: string;
  created_at: string;
  member_count?: number;
  role?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at: string | null;
  user?: User;
}

export interface Expense {
  id: string;
  group_id: string | null;
  paid_by: string;
  total_amount: number;
  description?: string;
  expense_date: string;
  currency: string;
  created_at: string;
  payer?: User;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  split_ratio: number;
  share_amount: number;
  user?: User;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: string;
  external_id?: string;
  metadata?: Record<string, unknown>;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
}

export interface Settlement {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  settlement_month: string;
  status: "pending" | "paid";
  created_at: string;
  from_user_details?: User;
  to_user_details?: User;
}

// ── API Response types ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
}

// ── Auth types ──
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  nickname?: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ── Expense form ──
export interface CreateExpensePayload {
  group_id?: string | null;
  total_amount: number;
  description?: string;
  expense_date: string;
  currency?: string;
  splits: { user_id: string; split_ratio: number }[];
}
