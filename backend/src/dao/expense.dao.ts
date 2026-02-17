import { keysToSnakeCase } from "src/utils/caseConverter";
import { db } from "../database/db";
import { IAddExpense, IUpdateExpense } from "../services/expense.service";
import { object } from "zod";

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

async function updateExpense({
  expenseId,
  data,
  splits,
}: {
  expenseId: string;
  data: IUpdateExpense;
  splits?: IExpenseSplit[];
}) {
  return await db.transaction(async (trx) => {
    const snakeCaseData = keysToSnakeCase(data);
    delete (snakeCaseData as any).splits;

    const updatePayload = Object.entries(snakeCaseData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    if (Object.keys(updatePayload).length > 0) {
      const setClause = Object.keys(updatePayload)
        .map((key) => `${key} = ?`)
        .join(", ");

      await trx.raw(`UPDATE expenses SET ${setClause} WHERE id = ?`, [
        ...Object.values(updatePayload),
        expenseId,
      ]);
    }

    if (splits && splits.length > 0) {
      await trx.raw(`DELETE FROM expense_splits WHERE expense_id = ?`, [
        expenseId,
      ]);
      for (const split of splits) {
        await trx.raw(
          `
            INSERT INTO expense_splits (id, expense_id, user_id, split_ratio, share_amount)
            VALUES (gen_random_uuid(), ?, ?, ?, ?)
          `,
          [expenseId, split.user_id, split.split_ratio, split.share_amount],
        );
      }
    }

    return await getExpenseById(expenseId);
  });
}

async function getExpenseById(id: string) {
  const result = await db.raw(
    `
      SELECT e.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', s.id,
                   'user_id', s.user_id,
                   'split_ratio', s.split_ratio,
                   'share_amount', s.share_amount,
                   'user', json_build_object(
                     'id', u.id,
                     'full_name', u.full_name,
                     'email', u.email,
                     'avatar', u.avatar
                   )
                 )
               ) FILTER (WHERE s.id IS NOT NULL),
               '[]'
             ) as splits
      FROM expenses e
      LEFT JOIN expense_splits s ON e.id = s.expense_id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE e.id = ?
      GROUP BY e.id
    `,
    [id],
  );
  return result.rows[0];
}

async function getGroupExpenses(groupId: string) {
  // const result = await db.raw(
  //   `
  //     SELECT e.*,
  //            COALESCE(
  //              json_agg(
  //                json_build_object(
  //                  'id', s.id,
  //                  'user_id', s.user_id,
  //                  'split_ratio', s.split_ratio,
  //                  'share_amount', s.share_amount,
  //                  'user', json_build_object(
  //                    'id', u.id,
  //                    'full_name', u.full_name,
  //                    'email', u.email,
  //                    'avatar', u.avatar
  //                  )
  //                )
  //              ) FILTER (WHERE s.id IS NOT NULL),
  //              '[]'
  //            ) as splits
  //     FROM expenses e
  //     LEFT JOIN expense_splits s ON e.id = s.expense_id
  //     LEFT JOIN users u ON s.user_id = u.id
  //     WHERE e.group_id = ?
  //     GROUP BY e.id
  //     ORDER BY e.expense_date DESC
  //   `,
  //   [groupId],
  // );

  const result = await db.raw(
    `
    SELECT e.*,
       COALESCE(
         json_agg(
           json_build_object(
             'split', to_jsonb(s),
             'user', to_jsonb(u)
           )
         ) FILTER (WHERE s.id IS NOT NULL),
         '[]'
       ) AS splits
    FROM expenses e
    LEFT JOIN expense_splits s ON e.id = s.expense_id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE e.group_id = ?
    GROUP BY e.id
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
  updateExpense,
  getExpenseById,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
};
