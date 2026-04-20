import { EventEmitter } from "events";

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();

export const EVENTS = {
  EMAIL: {
    SIGNUP: "email:signup",
    INVITE: "email:invite",
    EXPENSE_VERIFIED: "email:expense_verified",
    FORGOT_PASSWORD: "email:forgot_password",
    SETTLEMENT_UPLOADED: "email:settlement_uploaded",
    SETTLEMENT_CONFIRMED: "email:settlement_confirmed",
  },
};
