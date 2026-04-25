import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { Group, GroupDetails, GroupMember } from "../../lib/types";

interface GroupState {
  groups: {
    data: Group[];
    totalGroups: number;
    isLoading: boolean;
    error: string | null;
  };
  groupDetails: {
    data: GroupDetails | null;
    isLoading: boolean;
    error: string | null;
  };
  members: {
    data: GroupMember[];
    isLoading: boolean;
    error: string | null;
  };
  isLoading: boolean; //for delete, update, add member
  error: string | null; //for delete, update, add member
}

const initialState: GroupState = {
  groups: {
    totalGroups: 0,
    data: [],
    isLoading: false,
    error: null,
  },
  groupDetails: {
    data: null,
    isLoading: false,
    error: null,
  },
  members: {
    data: [],
    isLoading: false,
    error: null,
  },
  isLoading: false, //for delete, update, add member
  error: null, //for delete, update, add member
};

export const fetchMyGroupsAction = createAsyncThunk<Group[]>(
  "groups/fetchMyGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/groups");
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch groups",
      );
    }
  },
);

export const fetchGroupDetailsAction = createAsyncThunk<GroupDetails, string>(
  "groups/fetchGroupDetails",
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/groups/${groupId}`);
      const result = data.data;
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch group",
      );
    }
  },
);

export const createGroupAction = createAsyncThunk<Group, FormData>(
  "groups/createGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to create group",
      );
    }
  },
);

export const updateGroupAction = createAsyncThunk<
  GroupDetails,
  { groupId: string; formData: FormData }
>("groups/updateGroup", async ({ groupId, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/groups/${groupId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to update group",
    );
  }
});

export const addMemberToGroupAction = createAsyncThunk<
  GroupMember,
  { groupId: string; newMemberId: string }
>(
  "groups/addMemberToGroup",
  async ({ groupId, newMemberId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/groups/${groupId}/members`, {
        newMemberId,
      });
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to add member",
      );
    }
  },
);

export const leaveGroupAction = createAsyncThunk<void, string>(
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
    clearGroupDetails: (state) => {
      state.groupDetails.data = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch my groups
    builder.addCase(fetchMyGroupsAction.pending, (state) => {
      state.groups.isLoading = true;
      state.groups.error = null;
    });
    builder.addCase(fetchMyGroupsAction.fulfilled, (state, action) => {
      state.groups.isLoading = false;
      state.groups.data = action.payload;
      state.groups.totalGroups = action.payload.length;
    });
    builder.addCase(fetchMyGroupsAction.rejected, (state, action) => {
      state.groups.isLoading = false;
      state.groups.error = action.payload as string;
    });

    // Fetch group details
    builder.addCase(fetchGroupDetailsAction.pending, (state) => {
      state.groupDetails.isLoading = true;
      state.groupDetails.error = null;
    });
    builder.addCase(fetchGroupDetailsAction.fulfilled, (state, action) => {
      state.groupDetails.isLoading = false;
      state.groupDetails.data = action.payload;
    });
    builder.addCase(fetchGroupDetailsAction.rejected, (state, action) => {
      state.groupDetails.isLoading = false;
      state.groupDetails.error = action.payload as string;
    });

    // Create group
    builder.addCase(createGroupAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createGroupAction.fulfilled, (state, action) => {
      state.groups.data.push(action.payload);
      state.groups.totalGroups++;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(createGroupAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update group
    builder.addCase(updateGroupAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateGroupAction.fulfilled, (state, action) => {
      // Update group details if it's the current group
      if (
        state.groupDetails.data &&
        state.groupDetails.data.id === action.payload.id
      ) {
        state.groupDetails.data = {
          ...state.groupDetails.data,
          ...action.payload,
        };
      }

      // Update the group in the list
      const index = state.groups.data.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.groups.data[index] = {
          ...state.groups.data[index],
          ...action.payload,
        };
      }

      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updateGroupAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add member
    builder.addCase(addMemberToGroupAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addMemberToGroupAction.fulfilled, (state, action) => {
      state.members.data.push(action.payload);
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(addMemberToGroupAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Leave group
    builder.addCase(leaveGroupAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(leaveGroupAction.fulfilled, (state, action) => {
      state.groupDetails.data = null;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(leaveGroupAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearGroupDetails } = groupSlice.actions;

export default groupSlice.reducer;
