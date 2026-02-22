import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import groupReducer from "./slices/groupSlice";
import expenseReducer from "./slices/expenseSlice";
import themeReducer from "./slices/themeSlice";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";
import settlementReducer from "./slices/settlementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupReducer,
    expenses: expenseReducer,
    theme: themeReducer,
    ui: uiReducer,
    users: userReducer,
    settlements: settlementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
