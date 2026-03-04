export enum FORM_MODE {
  ADD = "add",
  EDIT = "edit",
  VIEW = "view",
}

export enum SUPPORTED_CURRENCIES {
  NPR = "NPR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  INR = "INR",
}

export enum SPLIT_MODE {
  EQUAL = "equal",
  PERCENTAGE = "percentage",
  AMOUNT = "amount",
}

export enum EXPENSE_TYPE {
  PERSONAL = "personal",
  GROUP = "group",
}

export enum EXPENSE_STATUS {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum SPLIT_STATUS {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum SETTLEMENT_STATUS {
  PENDING = "pending",
  PAID = "paid",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
}

/**
 * @description
 * if all split_status are verified then expense_status will be verified,
 * if one or more split_status are rejected then expense_status will be rejected,
 * if all split_status are mixed then expense_status will be submitted,
 * expense_status will be draft if the expense is not submitted yet,
 * if expense_status is verified then send email to all the members included in the split,
 */
