import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { User, PaymentMethod, Expense } from "../../lib/types";

interface UserProfileData {
  user: User;
  paymentMethods: PaymentMethod[];
  recentExpenses: Expense[];
}

interface UserState {
  searchResults: User[];
  isSearching: boolean;
  searchError: string | null;
  userProfile: {
    data: UserProfileData | null;
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: UserState = {
  searchResults: [],
  isSearching: false,
  searchError: null,
  userProfile: {
    data: null,
    isLoading: false,
    error: null,
  },
};

export const searchUsersAction = createAsyncThunk<User[], string>(
  "users/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users", {
        params: { query },
      });
      return data.data?.users;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to search users",
      );
    }
  },
);

export const fetchUserProfileAction = createAsyncThunk<UserProfileData, string>(
  "users/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}/profile`);
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load user profile",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.isSearching = false;
    },
    clearUserProfile: (state) => {
      state.userProfile.data = null;
      state.userProfile.error = null;
    },
  },
  extraReducers: (builder) => {
    // Search Users
    builder.addCase(searchUsersAction.pending, (state) => {
      state.isSearching = true;
      state.searchError = null;
    });
    builder.addCase(searchUsersAction.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchUsersAction.rejected, (state, action) => {
      state.isSearching = false;
      state.searchError = action.payload as string;
      state.searchResults = [];
    });

    // Fetch User Profile
    builder.addCase(fetchUserProfileAction.pending, (state) => {
      state.userProfile.isLoading = true;
    });
    builder.addCase(fetchUserProfileAction.fulfilled, (state, action) => {
      state.userProfile.isLoading = false;
      state.userProfile.data = action.payload;
    });
    builder.addCase(fetchUserProfileAction.rejected, (state, action) => {
      state.userProfile.isLoading = false;
      state.userProfile.error = action.payload as string;
    });
  },
});

export const { clearSearchResults, clearUserProfile } = userSlice.actions;

export default userSlice.reducer;
