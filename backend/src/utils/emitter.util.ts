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
  NOTIFICATION: {
    EXPENSE_CREATED: "notification:expense_created",
    EXPENSE_UPDATED: "notification:expense_updated",
    EXPENSE_DELETED: "notification:expense_deleted",
    EXPENSE_VERIFIED: "notification:expense_verified",
    MEMBER_ADDED: "notification:member_added",
    SETTLEMENT_PAID: "notification:settlement_paid",
    SETTLEMENT_CONFIRMED: "notification:settlement_confirmed",
  },
};
