import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { Expense, CreateExpensePayload } from "../../lib/types";

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
      const { data } = await api.post(
        `/expenses/group/${payload.params.groupId}`,
        payload.body,
      );
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
      state.personalExpenses = action.payload.filter((e) => !e.group_id);
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
      if (!action.payload.group_id) {
        state.personalExpenses.unshift(action.payload);
      } else {
        state.groupExpenses.unshift(action.payload);
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
