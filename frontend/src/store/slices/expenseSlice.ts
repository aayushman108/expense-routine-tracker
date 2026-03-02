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
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  personalExpenses: [],
  groupExpenses: [],
  currentExpense: null,
  isLoading: false,
  error: null,
};

export const fetchUserExpenses = createAsyncThunk<Expense[]>(
  "expenses/fetchUserExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/expenses/user");
      // data: { success, data: { data: Expense[], pagination: ... } }
      return data.data?.data || data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses",
      );
    }
  },
);

export const fetchGroupExpenses = createAsyncThunk<Expense[], string>(
  "expenses/fetchGroupExpenses",
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/expenses/group/${groupId}`);
      // data: { success, data: { data: Expense[], pagination: ... } }
      return data.data?.data || data.data || data;
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
      state.expenses = action.payload;
      state.personalExpenses = action.payload.filter(
        (e) => e.expense_type === EXPENSE_TYPE.PERSONAL,
      );
    });
    builder.addCase(fetchUserExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Group expenses
    builder.addCase(fetchGroupExpenses.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchGroupExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.groupExpenses = action.payload;
    });
    builder.addCase(fetchGroupExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch by ID
    builder.addCase(fetchExpenseById.fulfilled, (state, action) => {
      state.currentExpense = action.payload;
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

    // Update
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      const updatedExpense = action.payload;
      const index = state.expenses.findIndex((e) => e.id === updatedExpense.id);
      if (index !== -1) {
        state.expenses[index] = updatedExpense;
      }
      if (updatedExpense.expense_type === EXPENSE_TYPE.PERSONAL) {
        const pIndex = state.personalExpenses.findIndex(
          (e) => e.id === updatedExpense.id,
        );
        if (pIndex !== -1) state.personalExpenses[pIndex] = updatedExpense;
      } else {
        const gIndex = state.groupExpenses.findIndex(
          (e) => e.id === updatedExpense.id,
        );
        if (gIndex !== -1) state.groupExpenses[gIndex] = updatedExpense;
      }
      if (state.currentExpense?.id === updatedExpense.id) {
        state.currentExpense = updatedExpense;
      }
    });

    // Delete
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      state.personalExpenses = state.personalExpenses.filter(
        (e) => e.id !== action.payload,
      );
      state.groupExpenses = state.groupExpenses.filter(
        (e) => e.id !== action.payload,
      );
    });
  },
});

export const { clearExpenseError, clearCurrentExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
