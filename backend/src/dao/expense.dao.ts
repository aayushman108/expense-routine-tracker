import { keysToSnakeCase } from "src/utils/caseConverter";
import { db } from "../database/db";
import { IAddExpense, IUpdateExpense } from "../services/expense.service";
import { object } from "zod";

export interface IExpenseSplit {
  user_id: string;
  split_percentage: number;
  split_amount: number;
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
          INSERT INTO expense_splits (id, expense_id, user_id, split_percentage, split_amount)
          VALUES (gen_random_uuid(), ?, ?, ?, ?)
        `,
        [
          newExpense.id,
          split.user_id,
          split.split_percentage,
          split.split_amount,
        ],
      );

      // Create a pending settlement for each person who is not the payer
      if (split.user_id !== data.paidBy) {
        await trx.raw(
          `
            INSERT INTO settlements (id, expense_id, from_user, to_user, amount, status)
            VALUES (gen_random_uuid(), ?, ?, ?, ?, 'pending')
          `,
          [
            newExpense.id,
            split.user_id, // debtor
            data.paidBy, // creditor
            split.split_amount,
          ],
        );
      }
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
      // Also delete existing settlements for this expense to recreate them
      await trx.raw(`DELETE FROM settlements WHERE expense_id = ?`, [
        expenseId,
      ]);

      const currentExpense = await trx.raw(
        `SELECT group_id, paid_by FROM expenses WHERE id = ?`,
        [expenseId],
      );
      const { group_id, paid_by } = currentExpense.rows[0];

      for (const split of splits) {
        await trx.raw(
          `
            INSERT INTO expense_splits (id, expense_id, user_id, split_percentage, split_amount)
            VALUES (gen_random_uuid(), ?, ?, ?, ?)
          `,
          [
            expenseId,
            split.user_id,
            split.split_percentage,
            split.split_amount,
          ],
        );

        // Recreate pending settlement if it's a group expense
        if (split.user_id !== paid_by) {
          await trx.raw(
            `
              INSERT INTO settlements (id, expense_id, from_user, to_user, amount, status)
              VALUES (gen_random_uuid(), ?, ?, ?, ?, 'pending')
            `,
            [expenseId, split.user_id, paid_by, split.split_amount],
          );
        }
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
                   'split_percentage', s.split_percentage,
                   'split_amount', s.split_amount,
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

async function getGroupExpenses(
  groupId: string,
  limit: number,
  offset: number,
) {
  // The || operator merges JSON objects.

  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count
     FROM expenses
     WHERE group_id = ?`,
    [groupId],
  );

  const total = Number(totalCount.rows[0].total_count);

  const dataResult = await db.raw(
    `
    SELECT e.*,
       to_jsonb(p) AS payer,
       splits.data AS splits,
       COALESCE(settlement_info.data, '[]'::jsonb) AS settlements,
       COALESCE(settlement_info.overall_status, 'pending') AS settlement_status
    FROM (
      SELECT *
      FROM expenses
      WHERE group_id = ?
      ORDER BY expense_date DESC
      LIMIT ? OFFSET ?
    ) e
    LEFT JOIN users p ON e.paid_by = p.id
    LEFT JOIN LATERAL (
      SELECT 
        COALESCE(
          jsonb_agg(
            (to_jsonb(s) - ARRAY['expense_id', 'user_id']) || jsonb_build_object(
              'user', to_jsonb(u)
            )
          ),
          '[]'::jsonb
        ) AS data
      FROM expense_splits s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.expense_id = e.id
    ) splits ON true
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 'pending'
          WHEN BOOL_AND(s.status = 'paid') THEN 'paid'
          ELSE 'pending'
        END AS overall_status,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', s.id,
              'amount', s.amount,
              'status', s.status,
              'from_user', jsonb_build_object(
                'id', fu.id,
                'full_name', fu.full_name,
                'email', fu.email,
                'avatar', fu.avatar
              ),
              'to_user', jsonb_build_object(
                'id', tu.id,
                'full_name', tu.full_name,
                'email', tu.email,
                'avatar', tu.avatar
              )
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::jsonb
        ) AS data
      FROM settlements s
      LEFT JOIN users fu ON s.from_user = fu.id
      LEFT JOIN users tu ON s.to_user = tu.id
      WHERE s.expense_id = e.id
    ) settlement_info ON true
    ORDER BY e.expense_date DESC
    `,
    [groupId, limit, offset],
  );

  return { total, data: dataResult.rows };
}

async function getUserExpenses(userId: string, limit: number, offset: number) {
  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count
     FROM expenses e
     WHERE e.paid_by = ? OR e.id IN (
       SELECT expense_id FROM expense_splits WHERE user_id = ?
     )`,
    [userId, userId],
  );

  const total = Number(totalCount.rows[0].total_count);

  const dataResult = await db.raw(
    `
    SELECT e.*,
       p.full_name as payer_name,
       p.avatar as payer_avatar,
       CASE 
         WHEN e.group_id IS NULL THEN 'personal'
         ELSE COALESCE(settlement_info.overall_status, 'pending')
       END AS settlement_status,
       CASE
         WHEN e.group_id IS NULL THEN e.total_amount
         WHEN e.paid_by = ? THEN 
           (SELECT COALESCE(es.split_amount, 0) FROM expense_splits es WHERE es.expense_id = e.id AND es.user_id = ?) 
           + COALESCE(settlement_info.total_others_pending, 0)
         ELSE 
           (SELECT COALESCE(es.split_amount, 0) FROM expense_splits es WHERE es.expense_id = e.id AND es.user_id = ?) 
           - COALESCE(settlement_info.total_paid_by_me, 0)
       END AS user_amount,
       CASE
         WHEN e.group_id IS NULL THEN '[]'::jsonb
         ELSE COALESCE(settlement_info.data, '[]'::jsonb)
       END AS settlements
    FROM (
      SELECT *
      FROM expenses e
      WHERE e.paid_by = ? OR e.id IN (
        SELECT expense_id FROM expense_splits WHERE user_id = ?
      )
      ORDER BY e.expense_date DESC
      LIMIT ? OFFSET ?
    ) e
    LEFT JOIN users p ON e.paid_by = p.id
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 'pending'
          WHEN BOOL_AND(s.status = 'paid') THEN 'paid'
          ELSE 'pending'
        END AS overall_status,
        COALESCE(SUM(s.amount) FILTER (WHERE s.to_user = ? AND s.status = 'pending'), 0) AS total_others_pending,
        COALESCE(SUM(s.amount) FILTER (WHERE s.from_user = ? AND s.status = 'paid'), 0) AS total_paid_by_me,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', s.id,
              'amount', s.amount,
              'status', s.status,
              'from_user', jsonb_build_object(
                'id', fu.id,
                'full_name', fu.full_name,
                'email', fu.email,
                'avatar', fu.avatar
              ),
              'to_user', jsonb_build_object(
                'id', tu.id,
                'full_name', tu.full_name,
                'email', tu.email,
                'avatar', tu.avatar
              )
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::jsonb
        ) AS data
      FROM settlements s
      LEFT JOIN users fu ON s.from_user = fu.id
      LEFT JOIN users tu ON s.to_user = tu.id
      WHERE s.expense_id = e.id
      AND (s.from_user = ? OR s.to_user = ?)
    ) settlement_info ON true
    ORDER BY e.expense_date DESC
    `,
    [
      userId, // for user_amount calculation (payer case)
      userId, // for my split lookup
      userId, // for my split lookup
      userId, // for others' pending debt to me
      userId, // e.paid_by subquery
      userId, // e.id in subquery
      limit,
      offset,
      userId, // total_others_pending filter
      userId, // total_paid_by_me filter
      userId, // lateral join user filter
      userId, // lateral join user filter
    ],
  );

  return { total, data: dataResult.rows };
}

async function deleteExpense(id: string) {
  await db.raw(`DELETE FROM expenses WHERE id = ?`, [id]);
  return true;
}

async function updateSettlementStatus(
  settlementId: string,
  status: "pending" | "paid",
  proofImage?: { url: string; publicId: string },
) {
  const result = await db.raw(
    `UPDATE settlements 
     SET status = ?, proof_image = ? 
     WHERE id = ? 
     RETURNING *`,
    [status, proofImage ? JSON.stringify(proofImage) : null, settlementId],
  );
  return result.rows[0];
}

export const expenseDao = {
  createExpense,
  updateExpense,
  getExpenseById,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
  updateSettlementStatus,
};
