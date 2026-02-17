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
    const totalRatio = data.splits.reduce((acc, s) => acc + s.splitRatio, 0);

    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_ratio: split.splitRatio,
      share_amount: Number(
        ((split.splitRatio / totalRatio) * data.totalAmount).toFixed(2),
      ),
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.share_amount,
      0,
    );
    const diff = Number((data.totalAmount - sumCalculated).toFixed(2));

    if (diff !== 0) {
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === data.paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].share_amount = Number(
          (calculatedSplits[findIndex].share_amount + diff).toFixed(2),
        );
      }
    }
  }

  return await expenseDao.createExpense({ data, splits: calculatedSplits });
}

async function updateExpense(id: string, data: IUpdateExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  if (data.splits && data.splits.length > 0 && data?.totalAmount) {
    const totalRatio = data.splits.reduce((acc, s) => acc + s.splitRatio, 0);

    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_ratio: split.splitRatio,
      share_amount: Number(
        (
          (split.splitRatio / totalRatio) *
          (data?.totalAmount as number)
        ).toFixed(2),
      ),
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.share_amount,
      0,
    );
    const diff = Number((data?.totalAmount - sumCalculated).toFixed(2));

    if (diff !== 0) {
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === data.paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].share_amount = Number(
          (calculatedSplits[findIndex].share_amount + diff).toFixed(2),
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
