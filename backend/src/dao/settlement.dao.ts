import { db } from "../database/db";

/**
 * Fetches group balances including virtual debts (not yet settled)
 * and active settlements (paid or pending review).
 */
export async function getGroupBalances(groupId: string) {
  const query = `
    WITH raw_debts AS (
        -- Sum up all splits per user pair that aren't linked to a settlement
        SELECT 
          es.user_id AS from_id,
          e.paid_by AS to_id,
          SUM(es.split_amount) AS amount
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = ? 
          AND es.settlement_id IS NULL
          AND es.user_id != e.paid_by
        GROUP BY es.user_id, e.paid_by
    ),
    netted_debts AS (
        -- Net the debts between users (e.g., A owes B 10, B owes A 4 -> A owes B 6)
        SELECT 
            CASE WHEN d.from_id < d.to_id THEN d.from_id ELSE d.to_id END as u1,
            CASE WHEN d.from_id < d.to_id THEN d.to_id ELSE d.from_id END as u2,
            SUM(CASE WHEN d.from_id < d.to_id THEN d.amount ELSE -d.amount END) as net
        FROM raw_debts d
        GROUP BY u1, u2
        HAVING ABS(SUM(CASE WHEN d.from_id < d.to_id THEN d.amount ELSE -d.amount END)) > 0
    )
    -- 1. Virtual Debts (Pending initiation)
    SELECT 
        CASE WHEN net > 0 THEN u1 ELSE u2 END as from_user_id,
        CASE WHEN net > 0 THEN u2 ELSE u1 END as to_user_id,
        ABS(net) as total_amount,
        'pending' as status,
        NULL::uuid as settlement_id,
        NULL::jsonb as proof_image,
        fu.full_name as from_user_name,
        fu.email as from_user_email,
        fu.avatar as from_user_avatar,
        tu.full_name as to_user_name,
        tu.email as to_user_email,
        tu.avatar as to_user_avatar
    FROM netted_debts
    JOIN users fu ON (CASE WHEN net > 0 THEN u1 ELSE u2 END) = fu.id
    JOIN users tu ON (CASE WHEN net > 0 THEN u2 ELSE u1 END) = tu.id

    UNION ALL

    -- 2. Active Settlements (Paid or Pending review)
    SELECT 
        s.from_user_id,
        s.to_user_id,
        s.amount as total_amount,
        s.status,
        s.id as settlement_id,
        s.proof_image,
        fu.full_name as from_user_name,
        fu.email as from_user_email,
        fu.avatar as from_user_avatar,
        tu.full_name as to_user_name,
        tu.email as to_user_email,
        tu.avatar as to_user_avatar
    FROM settlements s
    JOIN users fu ON s.from_user_id = fu.id
    JOIN users tu ON s.to_user_id = tu.id
    WHERE s.group_id = ? 
      AND s.status IN ('pending', 'paid')
    ORDER BY status DESC, total_amount DESC
  `;

  const result = await db.raw(query, [groupId, groupId]);
  return result.rows;
}

/**
 * Calculates net debt between two users and creates a single settlement record,
 * linking all relevant expense splits to it.
 */
export async function settleBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  proofImage?: { url: string; publicId: string } | null,
) {
  return await db.transaction(async (trx) => {
    // 1. Calculate the net amount from the perspective of fromUserId
    const { rows } = await trx.raw(
      `
      SELECT SUM(CASE WHEN es.user_id = ? THEN es.split_amount ELSE -es.split_amount END) as net
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

    const net = Number(rows[0]?.net || 0);
    if (Math.abs(net) < 0.01) {
      throw new Error("No outstanding debts to settle between these users.");
    }

    // Determine actual payer/receiver based on the net sign
    const finalFrom = net > 0 ? fromUserId : toUserId;
    const finalTo = net > 0 ? toUserId : fromUserId;
    const finalAmount = Math.abs(net);

    // 2. Create the settlement record
    const settlementResult = await trx.raw(
      `
      INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, status, proof_image, paid_at)
      VALUES (?, ?, ?, ?, ?, ?::jsonb, ?)
      RETURNING *
    `,
      [
        groupId,
        finalFrom,
        finalTo,
        finalAmount,
        proofImage ? "paid" : "pending",
        proofImage ? JSON.stringify(proofImage) : null,
        proofImage ? new Date() : null,
      ],
    );

    const settlement = settlementResult.rows[0];

    // 3. Link splits involved in this netting to the new settlement
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

/**
 * Confirms or rejects the latest 'paid' settlement between two users.
 */
export async function confirmBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  reviewedBy: string,
  status: "confirmed" | "rejected" = "confirmed",
) {
  return await db.transaction(async (trx) => {
    // Find the most recent 'paid' settlement to act upon
    const findResult = await trx.raw(
      `
      SELECT id FROM settlements
      WHERE group_id = ? AND from_user_id = ? AND to_user_id = ? AND status = 'paid'
      ORDER BY created_at DESC LIMIT 1
    `,
      [groupId, fromUserId, toUserId],
    );

    if (findResult.rows.length === 0) {
      throw new Error("No paid settlement found to confirm.");
    }

    const settlementId = findResult.rows[0].id;

    const updateResult = await trx.raw(
      `
      UPDATE settlements
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `,
      [status, reviewedBy, settlementId],
    );

    if (status === "rejected") {
      // If rejected, free the splits so they can be settled again
      await trx.raw(
        `UPDATE expense_splits SET settlement_id = NULL WHERE settlement_id = ?`,
        [settlementId],
      );
    }

    return updateResult.rows[0];
  });
}

export async function updateSettlementStatus(
  settlementId: string,
  status: "pending" | "paid" | "confirmed" | "rejected",
  proofImage?: { url: string; publicId: string },
) {
  const result = await db.raw(
    `
    UPDATE settlements 
    SET status = ?, proof_image = ?, updated_at = CURRENT_TIMESTAMP
    ${status === "paid" ? ", paid_at = CURRENT_TIMESTAMP" : ""}
    WHERE id = ? 
    RETURNING *
  `,
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
