import { keysToSnakeCase } from "src/utils/caseConverter";
import { db } from "../database/db";
import { IAddExpense, IUpdateExpense } from "../services/expense.service";
import {
  EXPENSE_STATUS,
  SETTLEMENT_STATUS,
  SPLIT_STATUS,
} from "@expense-tracker/shared";

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
        INSERT INTO expenses (id, expense_type, group_id, paid_by, total_amount, description, expense_date, currency, expense_status)
        VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, COALESCE(?::expense_status_enum, ?::expense_status_enum))
        RETURNING *
      `,
      [
        data.expenseType,
        data.groupId,
        data.paidBy,
        data.totalAmount,
        data.description,
        data.expenseDate,
        data.currency,
        data.expenseStatus,
        EXPENSE_STATUS.DRAFT,
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
      // Settlements are cascade-deleted through expense_splits (ON DELETE CASCADE)

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
      }
    }

    return await getExpenseById(expenseId);
  });
}

async function getExpenseById(id: string) {
  const result = await db.raw(
    `
      SELECT e.*, 
             to_jsonb(p) AS payer,
             COALESCE(
               jsonb_agg(
               to_jsonb(s) - ARRAY['expense_id', 'user_id', 'settlement_id'] || 
               jsonb_build_object(
                   'user', to_jsonb(u),
                   'settlement', CASE WHEN st.id IS NOT NULL THEN
                     to_jsonb(st)
                   ELSE NULL END
                 )
               ) FILTER (WHERE s.id IS NOT NULL),
               '[]'::jsonb
             ) as splits,
             COALESCE(settlement_info.overall_status, 
               CASE WHEN e.group_id IS NULL THEN 'personal' ELSE ? END
             ) AS settlement_status
      FROM expenses e
      LEFT JOIN users p ON e.paid_by = p.id
      LEFT JOIN expense_splits s ON e.id = s.expense_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN settlements st ON s.settlement_id = st.id
      LEFT JOIN LATERAL (
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN ?
            WHEN BOOL_AND(COALESCE(st_inner.status = ?, FALSE)) THEN ?
            WHEN BOOL_AND(COALESCE(st_inner.status IN (?, ?), FALSE)) THEN ?
            ELSE ?
          END AS overall_status
        FROM expense_splits es_inner
        LEFT JOIN settlements st_inner ON es_inner.settlement_id = st_inner.id
        WHERE es_inner.expense_id = e.id
        AND es_inner.user_id != e.paid_by
      ) settlement_info ON true
      WHERE e.id = ?
      GROUP BY e.id, p.id, settlement_info.overall_status
    `,
    [
      SETTLEMENT_STATUS.PENDING,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.PENDING,
      id,
    ],
  );
  return result.rows[0];
}

async function getGroupExpenses(
  groupId: string,
  userId: string,
  limit: number,
  offset: number,
) {
  // The || operator merges JSON objects.

  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count
     FROM expenses
     WHERE group_id = ? AND (expense_status != 'draft' OR paid_by = ?)`,
    [groupId, userId],
  );

  const total = Number(totalCount.rows[0].total_count);

  const dataResult = await db.raw(
    `
    SELECT e.*,
       to_jsonb(p) AS payer,
       splits.data AS splits,
       COALESCE(settlement_info.overall_status, ?) AS settlement_status
    FROM (
      SELECT *
      FROM expenses
      WHERE group_id = ? AND (expense_status != 'draft' OR paid_by = ?)
      ORDER BY expense_date DESC
      LIMIT ? OFFSET ?
    ) e
    LEFT JOIN users p ON e.paid_by = p.id
    LEFT JOIN LATERAL (
      SELECT 
        COALESCE(
          jsonb_agg(
            (to_jsonb(s) - ARRAY['expense_id', 'user_id', 'settlement_id']) || jsonb_build_object(
              'user', to_jsonb(u),
              'settlement', CASE WHEN st.id IS NOT NULL THEN
              to_jsonb(st)
              ELSE NULL END
            )
          ),
          '[]'::jsonb
        ) AS data
      FROM expense_splits s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN settlements st ON s.settlement_id = st.id
      WHERE s.expense_id = e.id
    ) splits ON true
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN ?
          WHEN BOOL_AND(COALESCE(st_inner.status = ?, FALSE)) THEN ?
          WHEN BOOL_AND(COALESCE(st_inner.status IN (?, ?), FALSE)) THEN ?
          ELSE ?
        END AS overall_status
      FROM expense_splits es_inner
      LEFT JOIN settlements st_inner ON es_inner.settlement_id = st_inner.id
      WHERE es_inner.expense_id = e.id
      AND es_inner.user_id != e.paid_by
    ) settlement_info ON true
    ORDER BY e.expense_date DESC
    `,
    [
      SETTLEMENT_STATUS.PENDING,
      groupId,
      userId,
      limit,
      offset,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.PENDING,
    ],
  );

  return { total, data: dataResult.rows };
}

async function getUserExpenses(userId: string, limit: number, offset: number) {
  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count
     FROM expenses e
     WHERE e.paid_by = ? OR (
       e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?)
       AND e.expense_status != 'draft'
     )`,
    [userId, userId],
  );

  const total = Number(totalCount.rows[0].total_count);

  const dataResult = await db.raw(
    `
    SELECT e.*,
       p.full_name as payer_name,
       p.avatar as payer_avatar,
       g.name as group_name,
       g.image as group_image,
       splits.data as splits,
       CASE 
         WHEN e.group_id IS NULL THEN NULL
         ELSE COALESCE(settlement_info.overall_status, ?)
       END AS settlement_status,
       CASE
         WHEN e.group_id IS NULL THEN e.total_amount
         WHEN e.paid_by = ? THEN 
           e.total_amount - COALESCE(settlement_info.total_received_by_me, 0)
         ELSE 
           COALESCE(settlement_info.total_paid_by_me, 0)
       END AS user_amount,
       COALESCE(settlement_info.total_received_by_me, 0) AS total_received_by_me,
       COALESCE(settlement_info.total_paid_by_me, 0) AS total_paid_by_me
    FROM (
      SELECT *
      FROM expenses e
      WHERE e.paid_by = ? OR (
        e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?)
        AND e.expense_status != 'draft'
      )
      ORDER BY e.expense_date DESC
      LIMIT ? OFFSET ?
    ) e
    LEFT JOIN users p ON e.paid_by = p.id
    LEFT JOIN groups g ON e.group_id = g.id
    LEFT JOIN LATERAL (
      SELECT 
        COALESCE(
          jsonb_agg(
            (to_jsonb(s) - ARRAY['expense_id', 'user_id', 'settlement_id']) || jsonb_build_object(
              'user', to_jsonb(u),
              'settlement', CASE WHEN st.id IS NOT NULL THEN
                jsonb_build_object(
                  'id', st.id,
                  'status', st.status,
                  'proof_image', st.proof_image,
                  'created_at', st.created_at
                )
              ELSE NULL END
            )
          ),
          '[]'::jsonb
        ) AS data
      FROM expense_splits s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN settlements st ON s.settlement_id = st.id
      WHERE s.expense_id = e.id
    ) splits ON true
    LEFT JOIN LATERAL (
      SELECT 
        -- Calculation for overall status (all splits)
        CASE 
          WHEN COUNT(*) = 0 THEN ?
          WHEN BOOL_AND(COALESCE(st_all.status = ?, FALSE)) THEN ?
          WHEN BOOL_AND(COALESCE(st_all.status IN (?, ?), FALSE)) THEN ?
          ELSE ?
        END AS overall_status,
        -- Calculation for amount others have paid me (if I'm the payer)
        COALESCE(SUM(es_all.split_amount) FILTER (
          WHERE e.paid_by = ? AND es_all.user_id != ? AND st_all.status IN (?, ?)
        ), 0) AS total_received_by_me,
        -- Calculation for amount I have paid others (if I'm a spender)
        COALESCE(SUM(es_all.split_amount) FILTER (
          WHERE es_all.user_id = ? AND e.paid_by != ? AND st_all.status IN (?, ?)
        ), 0) AS total_paid_by_me
      FROM expense_splits es_all
      LEFT JOIN settlements st_all ON es_all.settlement_id = st_all.id
      WHERE es_all.expense_id = e.id
    ) settlement_info ON true
    ORDER BY e.expense_date DESC
    `,
    [
      SETTLEMENT_STATUS.PENDING,
      userId, // [1] CASE paid_by
      userId, // [2] Subquery paid_by
      userId, // [3] Subquery splits
      limit, // [4] LIMIT
      offset, // [5] OFFSET
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.PENDING,
      userId, // [6] Lateral total_received_by_me (paid_by)
      userId, // [7] Lateral total_received_by_me (user_id !=)
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
      userId, // [8] Lateral total_paid_by_me (user_id)
      userId, // [9] Lateral total_paid_by_me (paid_by !=)
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
    ],
  );

  return { total, data: dataResult.rows };
}

async function deleteExpense(id: string) {
  await db.raw(`DELETE FROM expenses WHERE id = ?`, [id]);
  return true;
}

async function updateSplitStatus(
  expenseId: string,
  splitId: string,
  splitStatus: SPLIT_STATUS,
  userId: string,
) {
  return await db.transaction(async (trx) => {
    // 0. Check if the expense is in DRAFT status
    const currentExpense = await trx.raw(
      `SELECT expense_status FROM expenses WHERE id = ?`,
      [expenseId],
    );

    if (
      !currentExpense.rows[0] ||
      currentExpense.rows[0].expense_status === EXPENSE_STATUS.DRAFT
    ) {
      throw new Error("Only submitted expenses can be verified.");
    }

    // 1. Update the split_status
    await trx.raw(
      `
        UPDATE expense_splits
        SET split_status = ?::split_status_enum
        WHERE id = ? AND expense_id = ? AND user_id = ?
      `,
      [splitStatus, splitId, expenseId, userId],
    );

    // 2. Recalculate expense_status
    // if all split_status are verified then expense_status will be verified,
    // if one or more split_status are rejected then expense_status will be rejected,
    // if all split_status are mixed then expense_status will be submitted.
    // However, if it's draft, maybe it stays draft? The comment says:
    // "expense_status will be draft if the expense is not submitted yet"
    // For now, if someone is verifying/rejecting logic, it's at least submitted.
    const splitsResult = await trx.raw(
      `SELECT split_status FROM expense_splits WHERE expense_id = ?`,
      [expenseId],
    );

    const splits = splitsResult.rows;
    let newExpenseStatus = EXPENSE_STATUS.SUBMITTED;

    const allVerified = splits.every(
      (s: any) => s.split_status === SPLIT_STATUS.VERIFIED,
    );
    const anyRejected = splits.some(
      (s: any) => s.split_status === SPLIT_STATUS.REJECTED,
    );

    if (anyRejected) {
      newExpenseStatus = EXPENSE_STATUS.REJECTED;
    } else if (allVerified && splits.length > 0) {
      newExpenseStatus = EXPENSE_STATUS.VERIFIED;
    }

    // 3. Update expense table
    await trx.raw(
      `UPDATE expenses SET expense_status = ?::expense_status_enum, updated_at = NOW() WHERE id = ?`,
      [newExpenseStatus, expenseId],
    );

    return newExpenseStatus;
  });
}

export const expenseDao = {
  createExpense,
  updateExpense,
  getExpenseById,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
  updateSplitStatus,
};
