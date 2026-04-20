import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { PaymentMethod } from "../../lib/types";

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentMethodState = {
  paymentMethods: [],
  isLoading: false,
  error: null,
};

// ── Thunks ──
export const fetchPaymentMethods = createAsyncThunk<PaymentMethod[]>(
  "paymentMethods/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/payment-methods");
      return data.data?.paymentMethods || [];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment methods",
      );
    }
  },
);

export const fetchTargetUserPaymentMethods = createAsyncThunk<
  PaymentMethod[],
  string
>("paymentMethods/fetchTarget", async (userId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/${userId}/profile`);
    const result = data.data || data;
    return result.paymentMethods || [];
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user payment methods",
    );
  }
});

export const createPaymentMethod = createAsyncThunk<
  PaymentMethod,
  { provider: string; metadata?: Record<string, unknown>; isDefault?: boolean }
>("paymentMethods/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/payment-methods", payload);
    return data.data?.paymentMethod;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to create payment method",
    );
  }
});

export const updatePaymentMethod = createAsyncThunk<
  PaymentMethod,
  {
    id: string;
    provider?: string;
    metadata?: Record<string, unknown>;
    isDefault?: boolean;
    isVerified?: boolean;
  }
>("paymentMethods/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/payment-methods/${id}`, payload);
    return data.data?.paymentMethod;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to update payment method",
    );
  }
});

export const deletePaymentMethod = createAsyncThunk<string, string>(
  "paymentMethods/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payment-methods/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete payment method",
      );
    }
  },
);

// ── Slice ──
const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState,
  reducers: {
    clearPaymentMethodError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        // If the new method is default, unset others
        if (action.payload.is_default) {
          state.paymentMethods = state.paymentMethods.map((pm) => ({
            ...pm,
            is_default: false,
          }));
        }
        state.paymentMethods.unshift(action.payload);
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updatePaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        // If updated method is now default, unset others
        if (action.payload.is_default) {
          state.paymentMethods = state.paymentMethods.map((pm) => ({
            ...pm,
            is_default: pm.id === action.payload.id,
          }));
        }
        state.paymentMethods = state.paymentMethods.map((pm) =>
          pm.id === action.payload.id ? action.payload : pm,
        );
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deletePaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = state.paymentMethods.filter(
          (pm) => pm.id !== action.payload,
        );
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Target User Payment Methods
    builder
      .addCase(fetchTargetUserPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTargetUserPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchTargetUserPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentMethodError } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;
