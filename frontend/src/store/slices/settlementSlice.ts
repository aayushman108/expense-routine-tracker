import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { GroupBalance } from "../../lib/types";

interface SettlementState {
  groupSettlementBalances: GroupBalance[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: SettlementState = {
  groupSettlementBalances: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchGroupSettlementBalances = createAsyncThunk<
  GroupBalance[],
  string
>(
  "settlements/fetchGroupSettlementBalances",
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/settlements/group/${groupId}/balances`);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch group balances",
      );
    }
  },
);

export const settleBulkAction = createAsyncThunk<
  void,
  {
    groupId: string;
    fromUserId: string;
    toUserId: string;
    proofImage?: File | null;
  }
>("settlements/settleBulk", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("fromUserId", payload.fromUserId);
    formData.append("toUserId", payload.toUserId);
    if (payload.proofImage) {
      formData.append("proofImage", payload.proofImage);
    }

    await api.post(
      `/settlements/group/${payload.groupId}/settle-bulk`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    // Refresh balances after settlement
    dispatch(fetchGroupSettlementBalances(payload.groupId));
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to settle bulk",
    );
  }
});

export const confirmBulkAction = createAsyncThunk<
  void,
  {
    groupId: string;
    fromUserId: string;
    toUserId: string;
  }
>("settlements/confirmBulk", async (payload, { dispatch, rejectWithValue }) => {
  try {
    await api.post(`/settlements/group/${payload.groupId}/confirm-bulk`, {
      fromUserId: payload.fromUserId,
      toUserId: payload.toUserId,
    });
    // Refresh balances after confirmation
    dispatch(fetchGroupSettlementBalances(payload.groupId));
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to confirm settlement",
    );
  }
});

const settlementSlice = createSlice({
  name: "settlements",
  initialState,
  reducers: {
    clearSettlementError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupSettlementBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupSettlementBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupSettlementBalances = action.payload;
      })
      .addCase(fetchGroupSettlementBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(settleBulkAction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(settleBulkAction.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(settleBulkAction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(confirmBulkAction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(confirmBulkAction.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(confirmBulkAction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSettlementError } = settlementSlice.actions;
export default settlementSlice.reducer;
