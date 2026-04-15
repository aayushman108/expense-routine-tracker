import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import groupReducer from "./slices/groupSlice";
import expenseReducer from "./slices/expenseSlice";
import themeReducer from "./slices/themeSlice";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";
import settlementReducer from "./slices/settlementSlice";
import paymentMethodReducer from "./slices/paymentMethodSlice";

const appReducer = combineReducers({
  auth: authReducer,
  groups: groupReducer,
  expenses: expenseReducer,
  theme: themeReducer,
  ui: uiReducer,
  users: userReducer,
  settlements: settlementReducer,
  paymentMethods: paymentMethodReducer,
});

const rootReducer = (state: any, action: any) => {
  if (
    action.type === "auth/logout/fulfilled" ||
    action.type === "auth/logout/rejected" ||
    action.type === "auth/resetAuth"
  ) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
