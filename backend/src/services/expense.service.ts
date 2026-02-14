import { expenseDao, IExpenseSplit } from "../dao/expense.dao";
import { ICreateExpenseSchema } from "@expense-tracker/shared/validationSchema";

export interface IAddExpense extends ICreateExpenseSchema {
  paidBy: string;
}

async function addExpense(data: IAddExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  if (data.splits && data.splits.length > 0) {
    const totalRatio = data.splits.reduce((acc, s) => acc + s.split_ratio, 0);

    calculatedSplits = data.splits.map((split) => ({
      user_id: split.user_id,
      split_ratio: split.split_ratio,
      share_amount: Number(
        ((split.split_ratio / totalRatio) * data.totalAmount).toFixed(2),
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
  getExpenseDetails,
  getGroupExpenses,
  getPersonalExpenses,
  deleteExpense,
};
