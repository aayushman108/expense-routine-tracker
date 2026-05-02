import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import { db } from "../database/db";

/**
 * Fetches group balances using a greedy settlement algorithm to minimize
 * the number of transactions (debt simplification).
 */
export async function getGroupBalances(groupId: string) {
  // 1. Fetch net balances and user details for all members with outstanding splits
  const balancesQuery = `
    WITH user_debts AS (
      SELECT 
        es.user_id,
        SUM(es.split_amount) as total_debt
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? 
        AND es.settlement_id IS NULL
        AND es.user_id != e.paid_by
        AND e.expense_status = 'verified'
      GROUP BY es.user_id
    ),
    user_credits AS (
      SELECT 
        e.paid_by as user_id,
        SUM(es.split_amount) as total_credit
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? 
        AND es.settlement_id IS NULL
        AND es.user_id != e.paid_by
        AND e.expense_status = 'verified'
      GROUP BY e.paid_by
    )
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.avatar,
      COALESCE(uc.total_credit, 0) - COALESCE(ud.total_debt, 0) as net_balance
    FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    LEFT JOIN user_debts ud ON u.id = ud.user_id
    LEFT JOIN user_credits uc ON u.id = uc.user_id
    WHERE gm.group_id = ?
    AND (ud.total_debt IS NOT NULL OR uc.total_credit IS NOT NULL)
  `;

  const balancesResult = await db.raw(balancesQuery, [
    groupId,
    groupId,
    groupId,
  ]);
  const users = balancesResult.rows;

  // 2. Greedy algorithm for simplified debts (Virtual Settlements)
  const simplifiedDebts = simplifyDebts(users);

  // 3. Fetch active settlements (Paid, Rejected, or Confirmed)
  const activeSettlementsQuery = `
    SELECT 
        s.from_user_id,
        s.to_user_id,
        s.amount as total_amount,
        s.status,
        s.id as settlement_id,
        s.proof_image,
        s.paid_at,
        s.reviewed_at,
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
      AND s.status IN (?, ?, ?, ?)
    ORDER BY status DESC, total_amount DESC
  `;

  const activeSettlementsResult = await db.raw(activeSettlementsQuery, [
    groupId,
    SETTLEMENT_STATUS.PENDING,
    SETTLEMENT_STATUS.PAID,
    SETTLEMENT_STATUS.REJECTED,
    SETTLEMENT_STATUS.CONFIRMED,
  ]);

  return [...simplifiedDebts, ...activeSettlementsResult.rows];
}

/**
 * Greedy algorithm to simplify debts.
 * Minimizes transactions by matching largest debtors with largest creditors.
 */
function simplifyDebts(users: any[]) {
  const debtors = users
    .filter((u) => parseFloat(u.net_balance) < -0.01)
    .sort((a, b) => parseFloat(a.net_balance) - parseFloat(b.net_balance));

  const creditors = users
    .filter((u) => parseFloat(u.net_balance) > 0.01)
    .sort((a, b) => parseFloat(b.net_balance) - parseFloat(a.net_balance));

  const transactions: any[] = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const debtorBalance = Math.abs(parseFloat(debtor.net_balance));
    const creditorBalance = parseFloat(creditor.net_balance);

    const amount = Math.min(debtorBalance, creditorBalance);

    transactions.push({
      from_user_id: debtor.id,
      to_user_id: creditor.id,
      total_amount: amount,
      status: SETTLEMENT_STATUS.PENDING, // This status marks it as a "Virtual Debt" in UI
      settlement_id: null,
      proof_image: null,
      from_user_name: debtor.full_name,
      from_user_email: debtor.email,
      from_user_avatar: debtor.avatar,
      to_user_name: creditor.full_name,
      to_user_email: creditor.email,
      to_user_avatar: creditor.avatar,
    });

    debtor.net_balance = (parseFloat(debtor.net_balance) + amount).toFixed(2);
    creditor.net_balance = (parseFloat(creditor.net_balance) - amount).toFixed(
      2,
    );

    if (Math.abs(parseFloat(debtor.net_balance)) < 0.01) i++;
    if (Math.abs(parseFloat(creditor.net_balance)) < 0.01) j++;
  }

  return transactions;
}

/**
 * Creates a settlement based on simplified debt and links relevant expense splits.
 * Since we use debt simplification, a settlement between A and B might cover
 * parts of multiple splits involving other users (middlemen).
 */
export async function settleBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  proofImage?: { url: string; publicId: string } | null,
) {
  return await db.transaction(async (trx) => {
    // 1. Calculate the simplified amount that SHOULD be paid between these two
    // We run the same greedy algorithm to find the current transaction amount
    const balancesQuery = `
      WITH user_debts AS (
        SELECT es.user_id, SUM(es.split_amount) as total_debt
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = ? AND es.settlement_id IS NULL AND es.user_id != e.paid_by AND e.expense_status = 'verified'
        GROUP BY es.user_id
      ),
      user_credits AS (
        SELECT e.paid_by as user_id, SUM(es.split_amount) as total_credit
        FROM expense_splits es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = ? AND es.settlement_id IS NULL AND es.user_id != e.paid_by AND e.expense_status = 'verified'
        GROUP BY e.paid_by
      )
      SELECT u.id, COALESCE(uc.total_credit, 0) - COALESCE(ud.total_debt, 0) as net_balance
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      LEFT JOIN user_debts ud ON u.id = ud.user_id
      LEFT JOIN user_credits uc ON u.id = uc.user_id
      WHERE gm.group_id = ?
    `;
    const { rows: users } = await trx.raw(balancesQuery, [
      groupId,
      groupId,
      groupId,
    ]);
    const simplified = simplifyDebts(users);

    const targetTransaction = simplified.find(
      (t) => t.from_user_id === fromUserId && t.to_user_id === toUserId,
    );

    if (!targetTransaction) {
      throw new Error(
        "No outstanding simplified debt to settle between these users.",
      );
    }

    const finalAmount = targetTransaction.total_amount;

    // 2. Create the settlement record
    const settlementResult = await trx.raw(
      `
      INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, status, proof_image, paid_at)
      VALUES (?, ?, ?, ?, ?, ?::jsonb, ?)
      RETURNING *
    `,
      [
        groupId,
        fromUserId,
        toUserId,
        finalAmount,
        proofImage ? SETTLEMENT_STATUS.PAID : SETTLEMENT_STATUS.PENDING,
        proofImage ? JSON.stringify(proofImage) : null,
        proofImage ? new Date() : null,
      ],
    );

    const settlement = settlementResult.rows[0];

    // 3. Link splits to this settlement
    // In simplified debt, we need to mark splits such that we reduce the payer's debt
    // and the receiver's credit. We use a simple heuristic: link ALL unsettled splits
    // that involve the payer as debtor OR the receiver as creditor.
    // This effectively "clears" the path in the debt graph.
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
          AND e.expense_status = 'verified'
          AND (
            es.user_id = ? OR -- payer's debt
            e.paid_by = ?     -- receiver's credit
          )
      )
    `,
      [settlement.id, groupId, fromUserId, toUserId],
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
  status:
    | SETTLEMENT_STATUS.CONFIRMED
    | SETTLEMENT_STATUS.REJECTED = SETTLEMENT_STATUS.CONFIRMED,
) {
  return await db.transaction(async (trx) => {
    // Find the most recent 'paid' settlement to act upon
    const findResult = await trx.raw(
      `
      SELECT id FROM settlements
      WHERE group_id = ? AND from_user_id = ? AND to_user_id = ? AND status = ?
      ORDER BY created_at DESC LIMIT 1
    `,
      [groupId, fromUserId, toUserId, SETTLEMENT_STATUS.PAID],
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

    if (status === SETTLEMENT_STATUS.REJECTED) {
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
  status: SETTLEMENT_STATUS,
  options: {
    proofImage?: { url: string; publicId: string };
    reviewedBy?: string;
  } = {},
) {
  return await db.transaction(async (trx) => {
    const { proofImage, reviewedBy } = options;

    const result = await trx.raw(
      `
      UPDATE settlements 
      SET status = ?, 
          proof_image = COALESCE(?, proof_image), 
          reviewed_by = COALESCE(?, reviewed_by),
          reviewed_at = CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE reviewed_at END,
          paid_at = CASE WHEN ? = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? 
      RETURNING *
    `,
      [
        status,
        proofImage ? JSON.stringify(proofImage) : null,
        reviewedBy,
        reviewedBy,
        status,
        settlementId,
      ],
    );

    const settlement = result.rows[0];

    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (status === SETTLEMENT_STATUS.REJECTED) {
      // If rejected, free the splits so they can be settled again
      await trx.raw(
        `UPDATE expense_splits SET settlement_id = NULL WHERE settlement_id = ?`,
        [settlementId],
      );
    } else if (status === SETTLEMENT_STATUS.PAID) {
      // Re-link splits if they were unlinked (e.g. from REJECTED state)
      // Logic for re-linking: link splits that belong to this group, are verified, not settled,
      // and involve the payer/receiver.
      await trx.raw(
        `
        UPDATE expense_splits
        SET settlement_id = ?
        WHERE id IN (
          SELECT es.id FROM expense_splits es
          JOIN expenses e ON es.expense_id = e.id
          WHERE e.group_id = ? AND es.settlement_id IS NULL AND e.expense_status = 'verified'
          AND (es.user_id = ? OR e.paid_by = ?)
        )
      `,
        [
          settlementId,
          settlement.group_id,
          settlement.from_user_id,
          settlement.to_user_id,
        ],
      );
    }

    return settlement;
  });
}

export const settlementDao = {
  getGroupBalances,
  settleBulk,
  confirmBulk,
  updateSettlementStatus,
};
