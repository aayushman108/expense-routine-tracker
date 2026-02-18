import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { User } from "../../lib/types";

interface UserState {
  searchResults: User[];
  isSearching: boolean;
  searchError: string | null;
}

const initialState: UserState = {
  searchResults: [],
  isSearching: false,
  searchError: null,
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

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.isSearching = false;
    },
  },
  extraReducers: (builder) => {
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
  },
});

export const { clearSearchResults } = userSlice.actions;

export default userSlice.reducer;
