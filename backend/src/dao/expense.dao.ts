import { keysToSnakeCase } from "src/utils/caseConverter";
import { db } from "../database/db";
import { IAddExpense, IUpdateExpense } from "../services/expense.service";

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
        INSERT INTO expenses (id, expense_type, group_id, paid_by, total_amount, description, expense_date, currency)
        VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?)
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
               CASE WHEN e.group_id IS NULL THEN 'personal' ELSE 'pending' END
             ) AS settlement_status
      FROM expenses e
      LEFT JOIN users p ON e.paid_by = p.id
      LEFT JOIN expense_splits s ON e.id = s.expense_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN settlements st ON s.settlement_id = st.id
      LEFT JOIN LATERAL (
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 'confirmed'
            WHEN BOOL_AND(COALESCE(st_inner.status = 'confirmed', FALSE)) THEN 'confirmed'
            WHEN BOOL_AND(COALESCE(st_inner.status IN ('paid', 'confirmed'), FALSE)) THEN 'paid'
            ELSE 'pending'
          END AS overall_status
        FROM expense_splits es_inner
        LEFT JOIN settlements st_inner ON es_inner.settlement_id = st_inner.id
        WHERE es_inner.expense_id = e.id
        AND es_inner.user_id != e.paid_by
      ) settlement_info ON true
      WHERE e.id = ?
      GROUP BY e.id, p.id, settlement_info.overall_status
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
          WHEN COUNT(*) = 0 THEN 'confirmed'
          WHEN BOOL_AND(COALESCE(st_inner.status = 'confirmed', FALSE)) THEN 'confirmed'
          WHEN BOOL_AND(COALESCE(st_inner.status IN ('paid', 'confirmed'), FALSE)) THEN 'paid'
          ELSE 'pending'
        END AS overall_status
      FROM expense_splits es_inner
      LEFT JOIN settlements st_inner ON es_inner.settlement_id = st_inner.id
      WHERE es_inner.expense_id = e.id
      AND es_inner.user_id != e.paid_by
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
       g.name as group_name,
       g.image as group_image,
       splits.data as splits,
       CASE 
         WHEN e.group_id IS NULL THEN NULL
         ELSE COALESCE(settlement_info.overall_status, 'pending')
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
      WHERE e.paid_by = ? OR e.id IN (
        SELECT expense_id FROM expense_splits WHERE user_id = ?
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
          WHEN COUNT(*) = 0 THEN 'confirmed'
          WHEN BOOL_AND(COALESCE(st_all.status = 'confirmed', FALSE)) THEN 'confirmed'
          WHEN BOOL_AND(COALESCE(st_all.status IN ('paid', 'confirmed'), FALSE)) THEN 'paid'
          ELSE 'pending'
        END AS overall_status,
        -- Calculation for amount others have paid me (if I'm the payer)
        COALESCE(SUM(es_all.split_amount) FILTER (
          WHERE e.paid_by = ? AND es_all.user_id != ? AND st_all.status IN ('paid', 'confirmed')
        ), 0) AS total_received_by_me,
        -- Calculation for amount I have paid others (if I'm a spender)
        COALESCE(SUM(es_all.split_amount) FILTER (
          WHERE es_all.user_id = ? AND e.paid_by != ? AND st_all.status IN ('paid', 'confirmed')
        ), 0) AS total_paid_by_me
      FROM expense_splits es_all
      LEFT JOIN settlements st_all ON es_all.settlement_id = st_all.id
      WHERE es_all.expense_id = e.id
    ) settlement_info ON true
    ORDER BY e.expense_date DESC
    `,
    [
      userId, // [1] CASE paid_by
      userId, // [2] Subquery paid_by
      userId, // [3] Subquery splits
      limit, // [4] LIMIT
      offset, // [5] OFFSET
      userId, // [6] Lateral total_received_by_me (paid_by)
      userId, // [7] Lateral total_received_by_me (user_id !=)
      userId, // [8] Lateral total_paid_by_me (user_id)
      userId, // [9] Lateral total_paid_by_me (paid_by !=)
    ],
  );

  return { total, data: dataResult.rows };
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
