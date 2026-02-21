import { expenseDao, IExpenseSplit } from "../dao/expense.dao";
import {
  ICreateExpenseSchema,
  IUpdateExpenseSchema,
} from "@expense-tracker/shared/validationSchema";

export type IAddExpense = ICreateExpenseSchema["body"] &
  ICreateExpenseSchema["params"] & {
    paidBy: string;
  };

export type IUpdateExpense = IUpdateExpenseSchema["body"];

async function addExpense(data: IAddExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  if (data.splits && data.splits.length > 0) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount,
    }));

    // Rounding adjustment logic (optional but good to keep if we double-check)
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

  return await expenseDao.createExpense({ data, splits: calculatedSplits });
}

async function updateExpense(id: string, data: IUpdateExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  if (data.splits && data.splits.length > 0 && data?.totalAmount) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount as number,
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.split_amount,
      0,
    );
    const diff = Number((data?.totalAmount - sumCalculated).toFixed(2));

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

  return await expenseDao.updateExpense({
    expenseId: id,
    data,
    splits: calculatedSplits,
  });
}

async function getExpenseDetails(id: string) {
  return await expenseDao.getExpenseById(id);
}

async function getGroupExpenses(groupId: string) {
  return await expenseDao.getGroupExpenses(groupId);
}

async function getPersonalExpenses(userId: string) {
  return await expenseDao.getUserExpenses(userId);
}

async function deleteExpense(id: string) {
  return await expenseDao.deleteExpense(id);
}

export const expenseService = {
  addExpense,
  updateExpense,
  getExpenseDetails,
  getGroupExpenses,
  getPersonalExpenses,
  deleteExpense,
};
