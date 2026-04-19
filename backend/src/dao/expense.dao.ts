import { keysToSnakeCase } from "src/utils/caseConverter";
import { db } from "../database/db";
import { IAddExpense, IUpdateExpense } from "../services/expense.service";
import {
  EXPENSE_STATUS,
  SETTLEMENT_STATUS,
  SPLIT_STATUS,
} from "@expense-tracker/shared";
import { NotFoundError, UnAuthorizedError } from "src/utils";

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
        data.groupId || null,
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
  userId,
  data,
  splits,
}: {
  expenseId: string;
  userId: string;
  data: IUpdateExpense;
  splits?: IExpenseSplit[];
}) {
  return await db.transaction(async (trx) => {
    // 1. Fetch current expense and check authorization
    const currentExpenseResult = await trx.raw(
      `SELECT expense_status, paid_by, group_id FROM expenses WHERE id = ?`,
      [expenseId],
    );

    const currentExpense = currentExpenseResult.rows[0];

    if (!currentExpense) {
      throw new NotFoundError("Expense not found.");
    }

    if (currentExpense.paid_by !== userId) {
      throw new UnAuthorizedError(
        "You are not authorized to update this expense.",
      );
    }

    if (currentExpense.expense_status === EXPENSE_STATUS.VERIFIED && currentExpense.group_id !== null) {
      throw new Error("Verified group expenses cannot be updated.");
    }

    const updatePayload = keysToSnakeCase(data);

    // Filter out undefined and null values
    Object.keys(updatePayload).forEach((key) => {
      if (
        (updatePayload as any)[key] === undefined ||
        (updatePayload as any)[key] === null
      ) {
        delete (updatePayload as any)[key];
      }
    });

    // If it was rejected and we are updating, reset to submitted unless explicitly draft
    if (
      currentExpense.expense_status === EXPENSE_STATUS.REJECTED &&
      !(updatePayload as any).expense_status
    ) {
      (updatePayload as any).expense_status = EXPENSE_STATUS.SUBMITTED;
    }

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
             (to_jsonb(p) - 'password_hash') AS payer,
             COALESCE(
               (SELECT jsonb_agg(pm.*) FROM (SELECT * FROM payment_methods WHERE user_id = e.paid_by ORDER BY is_default DESC, created_at DESC) pm),
               '[]'::jsonb
             ) AS payer_payment_methods,
             COALESCE(
               jsonb_agg(
               to_jsonb(s) - ARRAY['expense_id', 'user_id', 'settlement_id'] || 
               jsonb_build_object(
                   'user', (to_jsonb(u) - 'password_hash'),
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
  startDate?: string,
  endDate?: string,
  expenseStatus?: string,
  settlementStatus?: string,
) {
  // The || operator merges JSON objects.

  let whereClause = `WHERE group_id = ? AND (expense_status != 'draft' OR paid_by = ?)`;
  const queryParams: any[] = [groupId, userId];

  if (startDate) {
    whereClause += ` AND expense_date >= ?`;
    queryParams.push(startDate);
  }

  if (endDate) {
    whereClause += ` AND expense_date <= ?`;
    queryParams.push(endDate);
  }

  if (expenseStatus) {
    whereClause += ` AND expense_status = ?`;
    queryParams.push(expenseStatus);
  }

  if (settlementStatus) {
    if (settlementStatus === "personal") {
      whereClause += ` AND group_id IS NULL`;
    } else {
      whereClause += ` AND id IN (
        SELECT es_filter.expense_id
        FROM expense_splits es_filter
        LEFT JOIN settlements st_filter ON es_filter.settlement_id = st_filter.id
        JOIN expenses e_filter ON es_filter.expense_id = e_filter.id
        WHERE es_filter.user_id != e_filter.paid_by
        GROUP BY es_filter.expense_id
        HAVING 
          CASE 
            WHEN COUNT(*) = 0 THEN '${SETTLEMENT_STATUS.CONFIRMED}'
            WHEN BOOL_AND(COALESCE(st_filter.status = '${SETTLEMENT_STATUS.CONFIRMED}', FALSE)) THEN '${SETTLEMENT_STATUS.CONFIRMED}'
            WHEN BOOL_AND(COALESCE(st_filter.status IN ('${SETTLEMENT_STATUS.CONFIRMED}', '${SETTLEMENT_STATUS.PAID}'), FALSE)) THEN '${SETTLEMENT_STATUS.PAID}'
            ELSE '${SETTLEMENT_STATUS.PENDING}'
          END = ?
      )`;
      queryParams.push(settlementStatus);
    }
  }

  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count, COALESCE(SUM(total_amount), 0) AS total_amount
     FROM expenses
     ${whereClause}`,
    queryParams,
  );

  const total = Number(totalCount.rows[0].total_count);
  const totalAmount = Number(totalCount.rows[0].total_amount);

  const dataResult = await db.raw(
    `
    SELECT e.*,
       to_jsonb(p) AS payer,
       splits.data AS splits,
       COALESCE(settlement_info.overall_status, ?) AS settlement_status
    FROM (
      SELECT *
      FROM expenses
      ${whereClause}
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
      ...queryParams,
      limit,
      offset,
      SETTLEMENT_STATUS.CONFIRMED, // Result for COUNT(*) = 0 (payer-only group expense)
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.PAID, // Result for mix of paid/confirmed
      SETTLEMENT_STATUS.PENDING,
    ],
  );

  return { total, totalAmount, data: dataResult.rows };
}

async function getUserExpenses(
  userId: string,
  limit: number,
  offset: number,
  startDate?: string,
  endDate?: string,
  expenseStatus?: string,
  settlementStatus?: string,
  expenseType?: string,
) {
  let whereClause = `WHERE (e.paid_by = ? OR (
       e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?)
       AND e.expense_status != 'draft'
     ))`;
  const queryParams: any[] = [userId, userId];

  if (expenseType) {
    whereClause += ` AND e.expense_type = ?`;
    queryParams.push(expenseType);
  }

  if (startDate) {
    whereClause += ` AND e.expense_date >= ?`;
    queryParams.push(startDate);
  }

  if (endDate) {
    whereClause += ` AND e.expense_date <= ?`;
    queryParams.push(endDate);
  }

  if (expenseStatus) {
    whereClause += ` AND e.expense_status = ?`;
    queryParams.push(expenseStatus);
  }

  if (settlementStatus) {
    whereClause += ` AND e.id IN (
      SELECT es_filter.expense_id
      FROM expense_splits es_filter
      LEFT JOIN settlements st_filter ON es_filter.settlement_id = st_filter.id
      JOIN expenses e_filter ON es_filter.expense_id = e_filter.id
      WHERE es_filter.user_id != e_filter.paid_by
      GROUP BY es_filter.expense_id
      HAVING 
        CASE 
          WHEN COUNT(*) = 0 THEN '${SETTLEMENT_STATUS.CONFIRMED}'
          WHEN BOOL_AND(COALESCE(st_filter.status = '${SETTLEMENT_STATUS.CONFIRMED}', FALSE)) THEN '${SETTLEMENT_STATUS.CONFIRMED}'
          WHEN BOOL_AND(COALESCE(st_filter.status IN ('${SETTLEMENT_STATUS.CONFIRMED}', '${SETTLEMENT_STATUS.PAID}'), FALSE)) THEN '${SETTLEMENT_STATUS.PAID}'
          ELSE '${SETTLEMENT_STATUS.PENDING}'
        END = ?
    )`;
    queryParams.push(settlementStatus);
  }

  const totalCount = await db.raw(
    `SELECT COUNT(*) AS total_count, COALESCE(SUM(e.total_amount), 0) AS total_amount
     FROM expenses e
     ${whereClause}`,
    queryParams,
  );

  const total = Number(totalCount.rows[0].total_count);
  const totalAmount = Number(totalCount.rows[0].total_amount);

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
      ${whereClause}
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
          WHERE e.paid_by = ? AND es_all.user_id != ? AND st_all.status = ?
        ), 0) AS total_received_by_me,
        -- Calculation for amount I have paid others (if I'm a spender)
        COALESCE(SUM(es_all.split_amount) FILTER (
          WHERE es_all.user_id = ? AND e.paid_by != ? AND st_all.status = ?
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
      ...queryParams, // [2, 3] Subquery filters
      limit, // [4] LIMIT
      offset, // [5] OFFSET
      SETTLEMENT_STATUS.CONFIRMED, // Result for COUNT(*) = 0
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.PAID, // Result for mix
      SETTLEMENT_STATUS.PENDING,
      userId, // [6] Lateral total_received_by_me (paid_by)
      userId, // [7] Lateral total_received_by_me (user_id !=)
      SETTLEMENT_STATUS.CONFIRMED,
      userId, // [8] Lateral total_paid_by_me (user_id)
      userId, // [9] Lateral total_paid_by_me (paid_by !=)
      SETTLEMENT_STATUS.CONFIRMED,
    ],
  );

  return { total, totalAmount, data: dataResult.rows };
}

async function deleteExpense(id: string, userId: string) {
  return await db.transaction(async (trx) => {
    const currentExpenseResult = await trx.raw(
      `SELECT expense_status, paid_by, group_id FROM expenses WHERE id = ?`,
      [id],
    );

    const currentExpense = currentExpenseResult.rows[0];

    if (!currentExpense) {
      throw new NotFoundError("Expense not found.");
    }

    if (currentExpense.paid_by !== userId) {
      throw new UnAuthorizedError(
        "You are not authorized to delete this expense.",
      );
    }

    if (currentExpense.expense_status === EXPENSE_STATUS.VERIFIED && currentExpense.group_id !== null) {
      throw new Error("Verified group expenses cannot be deleted.");
    }

    await trx.raw(`DELETE FROM expenses WHERE id = ?`, [id]);
    return true;
  });
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

async function getUserSummary(userId: string) {
  const result = await db.raw(
    `
    WITH user_expenses AS (
      SELECT 
        e.id,
        e.expense_type,
        e.expense_status,
        e.total_amount,
        e.expense_date,
        e.paid_by,
        CASE 
          WHEN e.expense_type = 'personal' THEN e.total_amount
          ELSE COALESCE(es.split_amount, 0)
        END as user_share,
        CASE
          WHEN e.expense_type = 'group' AND e.paid_by != ? THEN
            COALESCE(es.split_amount, 0) - COALESCE(
              (SELECT SUM(es_inner.split_amount) 
               FROM expense_splits es_inner 
               JOIN settlements st ON es_inner.settlement_id = st.id 
               WHERE es_inner.expense_id = e.id AND es_inner.user_id = ? AND st.status = ?), 0
            )
          ELSE 0
        END as i_owe,
        CASE
          WHEN e.expense_type = 'group' AND e.paid_by = ? THEN
            (e.total_amount - COALESCE(es.split_amount, 0)) - COALESCE(
              (SELECT SUM(es_inner.split_amount) 
               FROM expense_splits es_inner 
               JOIN settlements st ON es_inner.settlement_id = st.id 
               WHERE es_inner.expense_id = e.id AND es_inner.user_id != e.paid_by AND st.status = ?), 0
            )
          ELSE 0
        END as others_owe
      FROM expenses e
      LEFT JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      WHERE e.paid_by = ? OR e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?)
    )
    SELECT
      -- Lifetime Spend (Personal + Verified Group Shares)
      COALESCE(SUM(user_share) FILTER (WHERE expense_type = 'personal' OR (expense_type = 'group' AND expense_status = 'verified')), 0) as lifetime_spend,

      -- Current Month Spend
      COALESCE(SUM(user_share) FILTER (
        WHERE (expense_type = 'personal' OR (expense_type = 'group' AND expense_status = 'verified'))
        AND date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
      ), 0) as current_month_spend,

      -- Personal Spend
      COALESCE(SUM(user_share) FILTER (WHERE expense_type = 'personal'), 0) as personal_spend,

      -- Spend in Groups (All time, verified)
      COALESCE(SUM(user_share) FILTER (WHERE expense_type = 'group' AND expense_status = 'verified'), 0) as group_spend,

      -- Remaining to Pay (I owe others)
      COALESCE(SUM(i_owe) FILTER (WHERE expense_type = 'group' AND expense_status = 'verified'), 0) as remaining_to_pay,

      -- Remaining to Receive (Others owe me)
      COALESCE(SUM(others_owe) FILTER (WHERE expense_type = 'group' AND expense_status = 'verified'), 0) as remaining_to_receive
    FROM user_expenses
    `,
    [
      userId,
      userId,
      SETTLEMENT_STATUS.CONFIRMED,
      userId,
      SETTLEMENT_STATUS.CONFIRMED,
      userId,
      userId,
      userId,
    ],
  );

  const row = result.rows[0];
  return {
    lifetimeSpend: Number(row.lifetime_spend || 0),
    currentMonthSpend: Number(row.current_month_spend || 0),
    personalSpend: Number(row.personal_spend || 0),
    groupSpend: Number(row.group_spend || 0),
    remainingToPay: Number(row.remaining_to_pay || 0),
    remainingToReceive: Number(row.remaining_to_receive || 0),
  };
}

async function getUserGroupSummaries(userId: string) {
  const result = await db.raw(
    `
    WITH user_expenses AS (
      SELECT 
        e.id,
        e.group_id,
        g.name as group_name,
        e.expense_status,
        e.total_amount,
        e.expense_date,
        e.paid_by,
        COALESCE(es.split_amount, 0) as user_share,
        GREATEST(0, CASE
          WHEN e.paid_by != ? THEN
            COALESCE(es.split_amount, 0) - COALESCE(
              (SELECT SUM(es_inner.split_amount) 
               FROM expense_splits es_inner 
               JOIN settlements st ON es_inner.settlement_id = st.id 
               WHERE es_inner.expense_id = e.id AND es_inner.user_id = ? AND st.status = ?), 0
            )
          ELSE 0
        END) as i_owe,
        GREATEST(0, CASE
          WHEN e.paid_by = ? THEN
            (e.total_amount - COALESCE(es.split_amount, 0)) - COALESCE(
              (SELECT SUM(es_inner.split_amount) 
               FROM expense_splits es_inner 
               JOIN settlements st ON es_inner.settlement_id = st.id 
               WHERE es_inner.expense_id = e.id AND es_inner.user_id != e.paid_by AND st.status = ?), 0
            )
          ELSE 0
        END) as others_owe
      FROM expenses e
      JOIN groups g ON e.group_id = g.id
      LEFT JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      WHERE e.expense_type = 'group' AND e.expense_status = 'verified'
      AND (e.paid_by = ? OR e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?))
    )
    SELECT
      group_id as id,
      MAX(group_name) as name,
      COALESCE(SUM(total_amount), 0) as total_group_spend,
      COALESCE(SUM(user_share), 0) as my_total_share,
      COALESCE(SUM(i_owe), 0) as i_owe_others,
      COALESCE(SUM(others_owe), 0) as others_owe_me
    FROM user_expenses
    GROUP BY group_id
    ORDER BY MAX(group_name) ASC
    `,
    [
      userId,
      userId,
      SETTLEMENT_STATUS.CONFIRMED,
      userId,
      SETTLEMENT_STATUS.CONFIRMED,
      userId,
      userId,
      userId,
    ]
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    totalGroupSpend: Number(row.total_group_spend || 0),
    myTotalShare: Number(row.my_total_share || 0),
    iOweOthers: Number(row.i_owe_others || 0),
    othersOweMe: Number(row.others_owe_me || 0),
  }));
}

async function getMonthlyAnalytics(userId: string) {
  const result = await db.raw(
    `
    WITH months AS (
      SELECT generate_series(1, 12) AS month_num
    ),
    user_expenses AS (
      SELECT 
        EXTRACT(MONTH FROM expense_date) AS month_num,
        CASE 
          WHEN expense_type = 'personal' THEN total_amount 
          ELSE 0 
        END AS personal_amt,
        CASE 
          WHEN expense_type = 'group' AND expense_status = 'verified' THEN 
            COALESCE((SELECT split_amount FROM expense_splits WHERE expense_id = e.id AND user_id = ?), 0)
          ELSE 0 
        END AS group_amt
      FROM expenses e
      WHERE (paid_by = ? OR e.id IN (SELECT expense_id FROM expense_splits WHERE user_id = ?))
      AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    )
    SELECT 
      TRIM(TO_CHAR(TO_DATE(m.month_num::text, 'MM'), 'Month')) AS month,
      COALESCE(SUM(ue.personal_amt), 0) AS personal_expense,
      COALESCE(SUM(ue.group_amt), 0) AS group_expense,
      (COALESCE(SUM(ue.personal_amt), 0) + COALESCE(SUM(ue.group_amt), 0)) AS total_expense
    FROM months m
    LEFT JOIN user_expenses ue ON m.month_num = ue.month_num
    GROUP BY m.month_num
    ORDER BY m.month_num;
    `,
    [userId, userId, userId],
  );

  return result.rows.map((row: any) => ({
    month: row.month,
    personalExpense: Number(row.personal_expense || 0),
    groupExpense: Number(row.group_expense || 0),
    totalExpense: Number(row.total_expense || 0),
  }));
}

export const expenseDao = {
  createExpense,
  updateExpense,
  getExpenseById,
  getGroupExpenses,
  getUserExpenses,
  getUserSummary,
  getUserGroupSummaries,
  getMonthlyAnalytics,
  deleteExpense,
  updateSplitStatus,
};
