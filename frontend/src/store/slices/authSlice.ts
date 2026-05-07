import api, { cancelAllRequests } from "../../lib/api";
import {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
} from "../../lib/types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isDeviceRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  verificationToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isDeviceRegistered: false,
  isLoading: false,
  error: null,
  verificationToken: null,
};

// ── Thunks ──
export const loginUser = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      const result = data.data || data;
      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      }
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const signupUser = createAsyncThunk<
  { message: string; data: { token: string } },
  SignupPayload
>("auth/signup", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(error.response?.data?.message || "Signup failed");
  }
});

export const verifyEmail = createAsyncThunk<
  { message: string; data: User },
  { token: string; activationCode: string }
>("auth/verifyEmail", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/verify-email", payload);
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Verification failed",
    );
  }
});

export const refreshAuth = createAsyncThunk<AuthResponse>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/refresh");
      const result = data.data || data;
      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      }
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Session expired",
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk<AuthResponse>(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      const result = data.data || data;
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      cancelAllRequests();
      await api.get("/auth/logout");
      localStorage.removeItem("accessToken");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      localStorage.removeItem("accessToken");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const updateProfile = createAsyncThunk<User, Partial<User>>(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/auth/update-profile", payload);
      return data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const uploadAvatar = createAsyncThunk<User, FormData>(
  "auth/uploadAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  },
);

export const changePassword = createAsyncThunk<
  { message: string },
  Record<string, string>
>("auth/changePassword", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/change-password", payload);
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to change password",
    );
  }
});

// ── Slice ──
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateNotificationStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.is_notification_enabled = action.payload;
      }
    },
    setDeviceRegistered: (state, action: PayloadAction<boolean>) => {
      state.isDeviceRegistered = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.verificationToken = action.payload.data.token;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Email
    builder.addCase(verifyEmail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, (state) => {
      state.isLoading = false;
      state.verificationToken = null;
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Refresh
    builder.addCase(refreshAuth.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(refreshAuth.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload.user || action.payload; // Handle both structures
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload avatar
    builder.addCase(uploadAvatar.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadAvatar.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(uploadAvatar.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Change password
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, updateNotificationStatus, setDeviceRegistered, clearError, resetAuth } =
  authSlice.actions;
export default authSlice.reducer;
