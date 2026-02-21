export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: { url: string; publicId: string } | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  nickname?: string;
  role: string;
  joined_at: string;
  left_at: string | null;
  user: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: { url: string; publicId: string } | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupDetails extends Group {
  members: GroupMember[];
}

export interface Expense {
  id: string;
  group_id: string | null;
  paid_by: string;
  total_amount: number | string;
  description?: string;
  expense_date: string;
  currency: string;
  created_at: string;
  updated_at?: string;
  payer?: User;
  payer_name?: string;
  splits?: ExpenseSplit[];
  settlement_status?: "pending" | "paid" | "personal";
}

export interface ExpenseSplit {
  id: string;
  expense_id?: string;
  user_id?: string;
  split_percentage: number;
  split_amount: number;
  user: User;
  settlement?: Settlement | null;
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
  expense_id?: string;
  expense_split_id?: string;
  from_user: User;
  to_user: User;
  amount: number;
  status: "pending" | "paid";
  proof_image?: { url: string; publicId: string } | null;
  created_at: string;
}

// ── API Response types ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Auth types ──
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface CreateExpensePayload {
  body: {
    totalAmount: number;
    description?: string;
    expenseDate: string;
    currency?: string;
    splits: { userId: string; splitPercentage: number; splitAmount: number }[];
  };
  params: {
    groupId?: string | null;
  };
}
