import { expenseDao, IExpenseSplit } from "../dao/expense.dao";
import {
  ICreateExpenseSchema,
  IUpdateExpenseSchema,
} from "@expense-tracker/shared/validationSchema";
import {
  EXPENSE_STATUS,
  EXPENSE_TYPE,
  SPLIT_STATUS,
} from "@expense-tracker/shared";
import { appEmitter, EVENTS } from "../utils/emitter.util";
import { keysToSnakeCase } from "../utils/caseConverter";

export type IAddExpense = ICreateExpenseSchema["body"] &
  ICreateExpenseSchema["params"] & {
    paidBy: string;
  };

export type IUpdateExpense = IUpdateExpenseSchema["body"];

async function addExpense(data: IAddExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  // Personal expenses don't need splits or settlement tracking
  if (
    data.expenseType !== EXPENSE_TYPE.PERSONAL &&
    data.splits &&
    data.splits.length > 0
  ) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount,
    }));

    // Rounding adjustment logic
    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.split_amount,
      0,
    );
    const diff = Number((data.totalAmount - sumCalculated).toFixed(2));

    if (diff !== 0) {
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === data.paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].split_amount = Number(
          (calculatedSplits[findIndex].split_amount + diff).toFixed(2),
        );
      }
    }
  }

  delete data.splits;

  // Personal expenses are auto-verified — no approval workflow needed
  if (data.expenseType === EXPENSE_TYPE.PERSONAL) {
    (data as any).expenseStatus = EXPENSE_STATUS.VERIFIED;
  }

  return await expenseDao.createExpense({ data, splits: calculatedSplits });
}

async function updateExpense(id: string, userId: string, data: IUpdateExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  // 1. Calculate new splits if totalAmount or splits are changed
  const totalAmount = data?.totalAmount;

  if (data.splits && data.splits.length > 0 && totalAmount) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount as number,
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.split_amount,
      0,
    );
    const diff = Number((totalAmount - sumCalculated).toFixed(2));

    if (diff !== 0) {
      const paidBy = data?.paidBy ?? userId;
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].split_amount = Number(
          (calculatedSplits[findIndex].split_amount + diff).toFixed(2),
        );
      }
    }
  }

  delete data.splits;

  return await expenseDao.updateExpense({
    expenseId: id,
    userId,
    data,
    splits: calculatedSplits,
  });
}

async function getExpenseDetails(id: string) {
  return await expenseDao.getExpenseById(id);
}

async function getGroupExpenses(
  groupId: string,
  userId: string,
  limit: number,
  offset: number,
) {
  return await expenseDao.getGroupExpenses(groupId, userId, limit, offset);
}

async function getPersonalExpenses(
  userId: string,
  limit: number,
  offset: number,
) {
  return await expenseDao.getUserExpenses(userId, limit, offset);
}

async function deleteExpense(id: string, userId: string) {
  return await expenseDao.deleteExpense(id, userId);
}

async function updateSplitStatus(
  expenseId: string,
  splitId: string,
  splitStatus: SPLIT_STATUS,
  userId: string,
) {
  const newExpenseStatus = await expenseDao.updateSplitStatus(
    expenseId,
    splitId,
    splitStatus,
    userId,
  );

  if (newExpenseStatus === EXPENSE_STATUS.VERIFIED) {
    // We need to fetch expense details to send the email
    const expense = await expenseDao.getExpenseById(expenseId);
    if (expense) {
      const splits =
        typeof expense.splits === "string"
          ? JSON.parse(expense.splits)
          : expense.splits;
      const emails = splits.map((s: any) => s.user.email).filter(Boolean);
      const payerName = expense.payer?.full_name || "Someone";
      appEmitter.emit(EVENTS.EMAIL.EXPENSE_VERIFIED, {
        emails,
        payerName,
        expenseDescription: expense.description,
        totalAmount: expense.total_amount,
        currency: expense.currency || "NPR",
      });
    }
  }

  return newExpenseStatus;
}

export const expenseService = {
  addExpense,
  updateExpense,
  getExpenseDetails,
  getGroupExpenses,
  getPersonalExpenses,
  deleteExpense,
  updateSplitStatus,
};
