import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { Expense, CreateExpensePayload } from "../../lib/types";
import {
  EXPENSE_TYPE,
  SPLIT_STATUS,
} from "@expense-tracker/shared/enum/general.enum";

interface ExpenseState {
  expenses: Expense[];
  personalExpenses: Expense[];
  groupExpenses: Expense[];
  currentExpense: Expense | null;
  summary: {
    lifetimeSpend: number;
    currentMonthSpend: number;
    personalSpend: number;
    groupSpend: number;
    remainingToPay: number;
    remainingToReceive: number;
  } | null;
  groupSummaries: {
    id: string;
    name: string;
    totalGroupSpend: number;
    myTotalShare: number;
    iOweOthers: number;
    othersOweMe: number;
  }[];
  monthlyAnalytics: {
    month: string;
    personalExpense: number;
    groupExpense: number;
    totalExpense: number;
  }[];
  isLoading: boolean;
  isDetailsLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAmount?: number;
  } | null;
}

const initialState: ExpenseState = {
  expenses: [],
  personalExpenses: [],
  groupExpenses: [],
  currentExpense: null,
  summary: null,
  groupSummaries: [],
  monthlyAnalytics: [],
  isLoading: false,
  isDetailsLoading: false,
  isSubmitting: false,
  error: null,
  pagination: null,
};

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  expenseStatus?: string;
  settlementStatus?: string;
  expenseType?: string;
}

export const fetchUserExpenses = createAsyncThunk<
  { data: Expense[]; pagination: { total: number; page: number; limit: number; totalPages: number; totalAmount?: number } },
  ExpenseFilters | undefined
>("expenses/fetchUserExpenses", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const { data } = await api.get(`/expenses/user?${params.toString()}`);
    return data.data; // { data: Expense[], pagination: ... }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch expenses",
    );
  }
});

export const fetchPersonalExpenses = createAsyncThunk<
  { data: Expense[]; pagination: { total: number; page: number; limit: number; totalPages: number; totalAmount?: number } },
  ExpenseFilters | undefined
>("expenses/fetchPersonalExpenses", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const { data } = await api.get(`/expenses/user?${params.toString()}`);
    return data.data; // { data: Expense[], pagination: ... }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch expenses",
    );
  }
});

export const fetchUserSummary = createAsyncThunk<ExpenseState["summary"], void>(
  "expenses/fetchUserSummary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/expenses/user/summary");
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch summary",
      );
    }
  },
);

export const fetchUserGroupSummaries = createAsyncThunk<ExpenseState["groupSummaries"], void>(
  "expenses/fetchUserGroupSummaries",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/expenses/user/group-summaries");
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch group summaries",
      );
    }
  },
);

export const fetchMonthlyAnalytics = createAsyncThunk<ExpenseState["monthlyAnalytics"], void>(
  "expenses/fetchMonthlyAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/expenses/user/analytics/monthly");
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch monthly analytics",
      );
    }
  },
);

export const fetchGroupExpenses = createAsyncThunk<
  { data: Expense[]; pagination: { total: number; page: number; limit: number; totalPages: number; totalAmount?: number } },
  { groupId: string; filters?: ExpenseFilters }
>(
  "expenses/fetchGroupExpenses",
  async ({ groupId, filters }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }

      const { data } = await api.get(
        `/expenses/group/${groupId}?${params.toString()}`,
      );
      return data.data; // { data: Expense[], pagination: ... }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch group expenses",
      );
    }
  },
);

export const fetchExpenseById = createAsyncThunk<Expense, string>(
  "expenses/fetchExpenseById",
  async (expenseId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/expenses/${expenseId}`);
      return data.data?.data || data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expense",
      );
    }
  },
);

export const createExpense = createAsyncThunk<Expense, CreateExpensePayload>(
  "expenses/createExpense",
  async (payload, { rejectWithValue }) => {
    try {
      const { groupId } = payload.params;
      const endpoint = groupId ? `/expenses/group/${groupId}` : "/expenses";

      const { data } = await api.post(endpoint, payload.body);
      return data.data?.data || data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create expense",
      );
    }
  },
);

export const deleteExpense = createAsyncThunk<string, string>(
  "expenses/deleteExpense",
  async (expenseId, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      return expenseId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete expense",
      );
    }
  },
);

export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; body: Partial<CreateExpensePayload["body"]> }
>("expenses/updateExpense", async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/expenses/${id}`, body);
    return data.data?.data || data.data || data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to update expense",
    );
  }
});

export const updateSplitStatus = createAsyncThunk<
  string,
  { expenseId: string; splitId: string; status: SPLIT_STATUS },
  { rejectValue: string }
>(
  "expenses/updateSplitStatus",
  async ({ expenseId, splitId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/expenses/${expenseId}/split/${splitId}/status`,
        { status },
      );
      return data.message; // Controller returns message containing new status
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to update split status",
      );
    }
  },
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
  },
  extraReducers: (builder) => {
    // User expenses
    builder.addCase(fetchUserExpenses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload.data;
    });
    builder.addCase(fetchUserExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Personal expenses
    builder.addCase(fetchPersonalExpenses.pending, () => {
      // Don't set global isLoading to true so it doesn't mask the whole page if fetched softly
    });
    builder.addCase(fetchPersonalExpenses.fulfilled, (state, action) => {
      state.personalExpenses = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchPersonalExpenses.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // User summary
    builder.addCase(fetchUserSummary.fulfilled, (state, action) => {
      state.summary = action.payload;
    });

    // User group summaries
    builder.addCase(fetchUserGroupSummaries.fulfilled, (state, action) => {
      state.groupSummaries = action.payload;
    });

    // Monthly analytics
    builder.addCase(fetchMonthlyAnalytics.fulfilled, (state, action) => {
      state.monthlyAnalytics = action.payload;
    });

    // Group expenses
    builder.addCase(fetchGroupExpenses.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchGroupExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.groupExpenses = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchGroupExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch by ID
    builder.addCase(fetchExpenseById.pending, (state) => {
      state.isDetailsLoading = true;
    });
    builder.addCase(fetchExpenseById.fulfilled, (state, action) => {
      state.isDetailsLoading = false;
      state.currentExpense = action.payload;
    });
    builder.addCase(fetchExpenseById.rejected, (state, action) => {
      state.isDetailsLoading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createExpense.fulfilled, (state, action) => {
      state.expenses.unshift(action.payload);
      if (action.payload.expense_type === EXPENSE_TYPE.PERSONAL) {
        state.personalExpenses.unshift(action.payload);
      } else {
        state.groupExpenses.unshift(action.payload);
      }
    });

    // Update expense
    builder.addCase(updateExpense.fulfilled, (state) => {
      state.isSubmitting = false;
    });
    builder.addCase(updateExpense.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(updateExpense.rejected, (state) => {
      state.isSubmitting = false;
    });

    // Update split status
    builder.addCase(updateSplitStatus.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(updateSplitStatus.fulfilled, (state) => {
      state.isSubmitting = false;
    });
    builder.addCase(updateSplitStatus.rejected, (state) => {
      state.isSubmitting = false;
    });

    // Delete
    builder.addCase(deleteExpense.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(deleteExpense.fulfilled, (state) => {
      state.isSubmitting = false;
    });
    builder.addCase(deleteExpense.rejected, (state) => {
      state.isSubmitting = false;
    });
  },
});

export const { clearExpenseError, clearCurrentExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
