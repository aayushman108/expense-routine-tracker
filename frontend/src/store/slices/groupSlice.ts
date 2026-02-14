import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/api";
import type { Group, GroupMember } from "@/src/lib/types";

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  members: GroupMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  currentGroup: null,
  members: [],
  isLoading: false,
  error: null,
};

export const fetchMyGroups = createAsyncThunk<Group[]>(
  "groups/fetchMyGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/groups");
      return data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch groups",
      );
    }
  },
);

export const fetchGroupDetails = createAsyncThunk<
  { group: Group; members: GroupMember[] },
  string
>("groups/fetchGroupDetails", async (groupId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/groups/${groupId}`);
    const result = data.data || data;
    return result;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch group",
    );
  }
});

export const createGroup = createAsyncThunk<Group, FormData>(
  "groups/createGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data || data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create group",
      );
    }
  },
);

export const updateGroup = createAsyncThunk<
  Group,
  { groupId: string; formData: FormData }
>("groups/updateGroup", async ({ groupId, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/groups/${groupId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data || data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to update group",
    );
  }
});

export const addMemberToGroup = createAsyncThunk<
  GroupMember,
  { groupId: string; email: string }
>("groups/addMember", async ({ groupId, email }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/groups/${groupId}/members`, { email });
    return data.data || data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to add member",
    );
  }
});

export const leaveGroup = createAsyncThunk<void, string>(
  "groups/leaveGroup",
  async (groupId, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${groupId}/leave`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to leave group",
      );
    }
  },
);

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch my groups
    builder.addCase(fetchMyGroups.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyGroups.fulfilled, (state, action) => {
      state.isLoading = false;
      state.groups = action.payload;
    });
    builder.addCase(fetchMyGroups.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch group details
    builder.addCase(fetchGroupDetails.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupDetails.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentGroup = action.payload.group;
      state.members = action.payload.members;
    });
    builder.addCase(fetchGroupDetails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create group
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.groups.unshift(action.payload);
    });

    // Update group
    builder.addCase(updateGroup.fulfilled, (state, action) => {
      const idx = state.groups.findIndex((g) => g.id === action.payload.id);
      if (idx !== -1) state.groups[idx] = action.payload;
      if (state.currentGroup?.id === action.payload.id) {
        state.currentGroup = action.payload;
      }
    });

    // Add member
    builder.addCase(addMemberToGroup.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });

    // Leave group
    builder.addCase(leaveGroup.fulfilled, (state, action) => {
      state.groups = state.groups.filter((g) => g.id !== action.meta.arg);
    });
  },
});

export const { clearGroupError, clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
