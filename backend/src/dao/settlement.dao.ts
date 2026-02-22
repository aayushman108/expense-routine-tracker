import { db } from "../database/db";

export async function getGroupBalances(groupId: string) {
  const result = await db.raw(
    `
    WITH raw_debts AS (
        -- Base debts from splits not yet linked to any settlement
        SELECT 
          es.user_id AS from_user_id,
          e.paid_by AS to_user_id,
          SUM(es.split_amount) AS total_amount
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = ? 
          AND es.settlement_id IS NULL
          AND es.user_id != e.paid_by
        GROUP BY es.user_id, e.paid_by
    ),
    net_pending_debts AS (
        SELECT 
            CASE WHEN d1.from_user_id < d1.to_user_id THEN d1.from_user_id ELSE d1.to_user_id END as u1,
            CASE WHEN d1.from_user_id < d1.to_user_id THEN d1.to_user_id ELSE d1.from_user_id END as u2,
            SUM(CASE WHEN d1.from_user_id < d1.to_user_id THEN d1.total_amount ELSE -d1.total_amount END) as net_amount
        FROM raw_debts d1
        GROUP BY u1, u2
    ),
    active_settlements AS (
        -- Payments that are paid or pending (but not confirmed/rejected)
        SELECT 
          id as settlement_id,
          from_user_id,
          to_user_id,
          amount as total_amount,
          status,
          proof_image,
          created_at
        FROM settlements
        WHERE group_id = ? 
          AND status IN ('pending', 'paid')
    )
    -- 1. Net Debts (Pending initiation)
    SELECT 
        CASE WHEN net_amount > 0 THEN u1 ELSE u2 END as from_user_id,
        CASE WHEN net_amount > 0 THEN u2 ELSE u1 END as to_user_id,
        ABS(net_amount) as total_amount,
        'pending' as status, -- Frontend expects 'pending' for debts usually
        NULL::jsonb as proof_image,
        NULL::uuid as settlement_id,
        fu.full_name as from_user_name,
        fu.avatar as from_user_avatar,
        tu.full_name as to_user_name,
        tu.avatar as to_user_avatar
    FROM net_pending_debts
    JOIN users fu ON (CASE WHEN net_amount > 0 THEN u1 ELSE u2 END) = fu.id
    JOIN users tu ON (CASE WHEN net_amount > 0 THEN u2 ELSE u1 END) = tu.id
    WHERE ABS(net_amount) > 0

    UNION ALL

    -- 2. Active Settlements (Paid or Pending review)
    SELECT 
        s.from_user_id,
        s.to_user_id,
        s.total_amount,
        s.status,
        s.proof_image,
        s.settlement_id,
        fu.full_name as from_user_name,
        fu.avatar as from_user_avatar,
        tu.full_name as to_user_name,
        tu.avatar as to_user_avatar
    FROM active_settlements s
    JOIN users fu ON s.from_user_id = fu.id
    JOIN users tu ON s.to_user_id = tu.id
    ORDER BY status DESC -- 'pending' (debts) first, then 'paid' etc.
    `,
    [groupId, groupId],
  );

  return result.rows;
}

export async function settleBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  proofImage?: { url: string; publicId: string } | null,
) {
  return await db.transaction(async (trx) => {
    // 1. Calculate the net amount from all unlinked splits between these two users
    const debtsResult = await trx.raw(
      `
      SELECT 
        SUM(CASE WHEN es.user_id = ? THEN es.split_amount ELSE -es.split_amount END) as net_amount
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? 
        AND es.settlement_id IS NULL
        AND (
          (es.user_id = ? AND e.paid_by = ?) OR 
          (es.user_id = ? AND e.paid_by = ?)
        )
      `,
      [fromUserId, groupId, fromUserId, toUserId, toUserId, fromUserId],
    );

    const netAmount = Number(debtsResult.rows[0].net_amount || 0);

    if (netAmount === 0) {
      throw new Error("No outstanding debts to settle between these users.");
    }

    // Determine direction based on sign
    const actualFrom = netAmount > 0 ? fromUserId : toUserId;
    const actualTo = netAmount > 0 ? toUserId : fromUserId;
    const absAmount = Math.abs(netAmount);

    // 2. Create the settlement record
    const settlementResult = await trx.raw(
      `
      INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, status, proof_image, paid_at)
      VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?::jsonb, ?)
      RETURNING *
      `,
      [
        groupId,
        actualFrom,
        actualTo,
        absAmount,
        proofImage ? "paid" : "pending",
        proofImage ? JSON.stringify(proofImage) : null,
        proofImage ? new Date() : null,
      ],
    );

    const settlement = settlementResult.rows[0];

    // 3. Link ALL these splits to this settlement
    await trx.raw(
      `
      UPDATE expense_splits
      SET settlement_id = ?
      WHERE id IN (
        SELECT es.id
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = ? 
          AND es.settlement_id IS NULL
          AND (
            (es.user_id = ? AND e.paid_by = ?) OR 
            (es.user_id = ? AND e.paid_by = ?)
          )
      )
      `,
      [settlement.id, groupId, fromUserId, toUserId, toUserId, fromUserId],
    );

    return settlement;
  });
}

export async function confirmBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  reviewedBy: string,
  status: "confirmed" | "rejected" = "confirmed",
) {
  return await db.transaction(async (trx) => {
    // In this architecture, we usually confirm a SPECIFIC settlement.
    // However, for compatibility with the controller, we'll find the active settlement(s)
    // between these users.

    const settlementResult = await trx.raw(
      `
      SELECT id FROM settlements
      WHERE group_id = ? 
        AND from_user_id = ? 
        AND to_user_id = ? 
        AND status = 'paid'
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [groupId, fromUserId, toUserId],
    );

    if (settlementResult.rows.length === 0) {
      throw new Error("No paid settlement found to confirm.");
    }

    const settlementId = settlementResult.rows[0].id;

    const result = await trx.raw(
      `
      UPDATE settlements
      SET status = ?, 
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
      `,
      [status, reviewedBy, settlementId],
    );

    if (status === "rejected") {
      // If rejected, unlink the splits
      await trx.raw(
        `UPDATE expense_splits SET settlement_id = NULL WHERE settlement_id = ?`,
        [settlementId],
      );
    }

    return result.rows[0];
  });
}

async function updateSettlementStatus(
  settlementId: string,
  status: "pending" | "paid" | "confirmed" | "rejected",
  proofImage?: { url: string; publicId: string },
) {
  const result = await db.raw(
    `UPDATE settlements 
     SET status = ?, proof_image = ?, updated_at = CURRENT_TIMESTAMP
     ${status === "paid" ? ", paid_at = CURRENT_TIMESTAMP" : ""}
     WHERE id = ? 
     RETURNING *`,
    [status, proofImage ? JSON.stringify(proofImage) : null, settlementId],
  );
  return result.rows[0];
}

export const settlementDao = {
  getGroupBalances,
  settleBulk,
  confirmBulk,
  updateSettlementStatus,
};
