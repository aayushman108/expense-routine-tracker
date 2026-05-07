import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MessagePayload } from "firebase/messaging";
import api from "../../lib/api";

/**
 * Shape of the FCM data payload sent by our backend.
 * All fields are strings because FCM data payloads only support string values.
 */
export interface FCMEventData {
  url?: string;
  groupId?: string;
}

export interface FCMEvent {
  title?: string;
  body?: string;
  type?: string;
  data: FCMEventData;
  /** Unique key so downstream effects can distinguish repeated events of the same type */
  eventId: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  message?: string; // Original field from DB
  data: FCMEventData;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  type: string;
}

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  isFetchingMore: boolean;
  isMarkingAllRead: boolean;
  page: number;
  hasMore: boolean;
  /** The most recent FCM foreground event — consumed by page-level hooks */
  lastEvent: FCMEvent | null;
}

const initialState: NotificationState = {
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  isFetchingMore: false,
  isMarkingAllRead: false,
  page: 1,
  hasMore: true,
  lastEvent: null,
};

// ── Thunks ──────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; page: number },
  { page?: number; limit?: number } | void
>("notifications/fetchNotifications", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const { data } = await api.get(
      `/notifications?page=${page}&limit=${limit}`,
    );
    return { notifications: data.data, page };
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch notifications",
    );
  }
});

export const fetchUnreadCount = createAsyncThunk<number, void>(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      return data.data.count;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch unread count",
      );
    }
  },
);

export const markAsRead = createAsyncThunk<string, string>(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAllAsRead = createAsyncThunk<void, void>(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/read-all");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

export const unregisterFCMToken = createAsyncThunk<void, { token: string }>(
  "notifications/unregisterFCMToken",
  async ({ token }, { rejectWithValue }) => {
    try {
      await api.delete("/notifications/remove-token", { data: { token } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to unregister notification token",
      );
    }
  },
);

// ── Slice ───────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /**
     * Store the incoming FCM payload so page-level hooks can react to it.
     * We normalise the MessagePayload into our leaner FCMEvent shape.
     */
    setFCMEvent: (state, action: PayloadAction<MessagePayload>) => {
      const payload = action.payload;
      state.lastEvent = {
        title: payload.notification?.title,
        body: payload.notification?.body,
        type: payload.data?.type,
        data: {
          url: payload.data?.url,
          groupId: payload.data?.groupId,
        },
        eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    },
    /** Page-level hooks call this after they've handled the event */
    clearFCMEvent: (state) => {
      state.lastEvent = null;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    resetPagination: (state) => {
      state.page = 1;
      state.hasMore = true;
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
    builder.addCase(fetchNotifications.pending, (state, action) => {
      if (action.meta.arg && action.meta.arg.page && action.meta.arg.page > 1) {
        state.isFetchingMore = true;
      } else {
        state.isLoading = true;
      }
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isFetchingMore = false;

      const { notifications, page } = action.payload;
      const normalized = notifications.map((n: any) => {
        let url = n.data?.url;
        // Basic normalization for old group URLs
        if (url && url.startsWith("/groups/") && !url.startsWith("/dashboard")) {
          url = `/dashboard${url}`;
        }
        
        return {
          ...n,
          body: n.body || n.message,
          data: {
            ...n.data,
            url
          }
        };
      });

      if (page === 1) {
        state.notifications = normalized;
      } else {
        // Filter out duplicates if any (though backend offset should handle it)
        const existingIds = new Set(state.notifications.map((n) => n.id));
        const uniqueNew = normalized.filter((n) => !existingIds.has(n.id));
        state.notifications = [...state.notifications, ...uniqueNew];
      }

      state.page = page;
      state.hasMore = notifications.length === (action.meta.arg?.limit || 10);
    });
    builder.addCase(fetchNotifications.rejected, (state) => {
      state.isLoading = false;
      state.isFetchingMore = false;
    });
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
    builder.addCase(markAllAsRead.pending, (state) => {
      state.isMarkingAllRead = true;
    });
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.isMarkingAllRead = false;
      state.notifications.forEach((n) => (n.is_read = true));
      state.unreadCount = 0;
    });
    builder.addCase(markAllAsRead.rejected, (state) => {
      state.isMarkingAllRead = false;
    });
  },
});

export const { setFCMEvent, clearFCMEvent, setUnreadCount, resetPagination } =
  notificationSlice.actions;
export default notificationSlice.reducer;
