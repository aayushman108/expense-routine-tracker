import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface UiState {
  sidebarOpen: boolean;
  modalOpen: string | null; // modal identifier or null
  toasts: Toast[];
}

const initialState: UiState = {
  sidebarOpen: true,
  modalOpen: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalOpen = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = null;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;
