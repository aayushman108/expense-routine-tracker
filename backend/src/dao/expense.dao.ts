import { db } from "../database/db";
import { IAddExpense } from "../services/expense.service";

export interface IExpenseSplit {
  user_id: string;
  split_ratio: number;
  share_amount: number;
}

async function createExpense({
  data,
  splits,
}: {
  data: Omit<IAddExpense, "splits">;
  splits: IExpenseSplit[];
}) {
  return await db.transaction(async (trx) => {
    const expenseResult = await trx.raw(
      `
        INSERT INTO expenses (id, group_id, paid_by, total_amount, description, expense_date, currency)
        VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      [
        data.groupId,
        data.paidBy,
        data.totalAmount,
        data.description,
        data.expenseDate,
        data.currency,
      ],
    );

    const newExpense = expenseResult.rows[0];

    for (const split of splits) {
      await trx.raw(
        `
          INSERT INTO expense_splits (id, expense_id, user_id, split_ratio, share_amount)
          VALUES (gen_random_uuid(), ?, ?, ?, ?)
        `,
        [newExpense.id, split.user_id, split.split_ratio, split.share_amount],
      );
    }

    return newExpense;
  });
}

async function getExpenseById(id: string) {
  const result = await db.raw(
    `
      SELECT e.*, 
             json_agg(json_build_object(
               'user_id', s.user_id, 
               'split_ratio', s.split_ratio, 
               'share_amount', s.share_amount
             )) as splits
      FROM expenses e
      LEFT JOIN expense_splits s ON e.id = s.expense_id
      WHERE e.id = ?
      GROUP BY e.id
    `,
    [id],
  );
  return result.rows[0];
}

async function getGroupExpenses(groupId: string) {
  const result = await db.raw(
    `
      SELECT e.*, u.full_name as paid_by_name
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      ORDER BY e.expense_date DESC
    `,
    [groupId],
  );
  return result.rows;
}

async function getUserExpenses(userId: string) {
  const result = await db.raw(
    `
      SELECT e.*
      FROM expenses e
      WHERE e.paid_by = ? OR e.id IN (
        SELECT expense_id FROM expense_splits WHERE user_id = ?
      )
      ORDER BY e.expense_date DESC
    `,
    [userId, userId],
  );
  return result.rows;
}

async function deleteExpense(id: string) {
  await db.raw(`DELETE FROM expenses WHERE id = ?`, [id]);
  return true;
}

export const expenseDao = {
  createExpense,
  getExpenseById,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
};
