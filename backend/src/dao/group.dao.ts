import { db } from "../database/db";
import {
  ICreateGroupInput,
  IUpdateGroupInput,
} from "@expense-tracker/shared/validationSchema";
import {
  EXPENSE_STATUS,
  SETTLEMENT_STATUS,
} from "@expense-tracker/shared";
import { keysToSnakeCase } from "../utils/caseConverter";

export interface IGroup {
  id: string;
  name: string;
  description: string | null;
  image: { url: string; publicId: string } | null;
  created_by: string;
  created_at: Date;
  role?: "member" | "admin";
  total_group_spend?: number;
  total_paid_by_me?: number;
  my_total_share?: number;
  net_balance?: number;
  pending_verifications?: number;
}

export interface ICreateGroup extends ICreateGroupInput {
  created_by: string;
}

export interface IGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "member" | "admin";
  left_at: Date | null;
}

const createGroup = async (group: ICreateGroup) => {
  return await db.transaction(async (trx) => {
    // 1. Create the group
    const groupResult = await trx.raw(
      `INSERT INTO groups (name, description, image, created_by) 
         VALUES (?, ?, ?, ?) 
         RETURNING *`,
      [
        group.name,
        group.description || null,
        group.image ? JSON.stringify(group.image) : null,
        group.created_by,
      ],
    );
    const newGroup = groupResult.rows[0];

    // 2. Add the creator as an admin member
    await trx.raw(
      `INSERT INTO group_members (id, group_id, user_id, role, left_at) 
         VALUES (gen_random_uuid(), ?, ?, 'admin', NULL)`,
      [newGroup.id, group.created_by],
    );

    return newGroup;
  });
};

const findById = async (id: string): Promise<IGroup | null> => {
  const { rows } = await db.raw("SELECT * FROM groups WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0] || null;
};

const findByUserId = async (userId: string): Promise<IGroup[]> => {
  const { rows } = await db.raw(
    `WITH group_stats AS (
      SELECT 
        e.group_id,
        COALESCE(SUM(e.total_amount), 0) as total_group_spend,
        COALESCE(SUM(CASE WHEN e.paid_by = ? THEN e.total_amount ELSE 0 END), 0) as total_paid_by_me,
        COALESCE(SUM(es.split_amount), 0) as my_total_share,
        COALESCE(SUM(
          GREATEST(0, CASE
            WHEN e.paid_by != ? THEN
              COALESCE(es.split_amount, 0) - COALESCE(
                (SELECT SUM(es_inner.split_amount) 
                 FROM expense_splits es_inner 
                 JOIN settlements st ON es_inner.settlement_id = st.id 
                 WHERE es_inner.expense_id = e.id AND es_inner.user_id = ? AND st.status = 'confirmed'), 0
              )
            ELSE 0
          END)
        ), 0) as i_owe_others,
        COALESCE(SUM(
          GREATEST(0, CASE
            WHEN e.paid_by = ? THEN
              (e.total_amount - COALESCE(es.split_amount, 0)) - COALESCE(
                (SELECT SUM(es_inner.split_amount) 
                 FROM expense_splits es_inner 
                 JOIN settlements st ON es_inner.settlement_id = st.id 
                 WHERE es_inner.expense_id = e.id AND es_inner.user_id != e.paid_by AND st.status = 'confirmed'), 0
              )
            ELSE 0
          END)
        ), 0) as others_owe_me
      FROM expenses e
      LEFT JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      WHERE e.expense_type = 'group' AND e.expense_status = 'verified'
      GROUP BY e.group_id
    ),
    pending_stats AS (
      SELECT 
        e.group_id,
        COUNT(*) as pending_count
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.expense_type = 'group' 
        AND e.expense_status = 'submitted' 
        AND es.user_id = ? 
        AND es.split_status = 'pending'
      GROUP BY e.group_id
    )
    SELECT 
      g.*,
      gm.role,
      COALESCE(gs.total_group_spend, 0) as total_group_spend,
      COALESCE(gs.total_paid_by_me, 0) as total_paid_by_me,
      COALESCE(gs.my_total_share, 0) as my_total_share,
      COALESCE(gs.others_owe_me, 0) - COALESCE(gs.i_owe_others, 0) as net_balance,
      COALESCE(ps.pending_count, 0) as pending_verifications
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN group_stats gs ON g.id = gs.group_id
    LEFT JOIN pending_stats ps ON g.id = ps.group_id
    WHERE gm.user_id = ? AND gm.left_at IS NULL
    ORDER BY g.created_at DESC`,
    [userId, userId, userId, userId, userId, userId, userId],
  );
  return rows;
};

const updateGroup = async (groupId: string, updates: IUpdateGroupInput) => {
  const snakeUpdates = keysToSnakeCase(updates);

  if (snakeUpdates.image) {
    snakeUpdates.image = JSON.stringify(snakeUpdates.image);
  }

  const keys = Object.keys(snakeUpdates);
  if (keys.length === 0) return null;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = [...Object.values(snakeUpdates), groupId];

  const { rows } = await db.raw(
    `UPDATE groups SET ${setClause} WHERE id = ? RETURNING *`,
    values,
  );
  return rows[0];
};

const deleteGroup = async (groupId: string) => {
  await db.raw("DELETE FROM groups WHERE id = ?", [groupId]);
  return true;
};

const addMember = async (member: {
  group_id: string;
  user_id: string;
  nickname: string | null;
  role?: string;
}) => {
  const { rows } = await db.raw(
    `INSERT INTO group_members (group_id, user_id, nickname, role) 
     VALUES (?, ?, ?, ?) 
     ON CONFLICT (group_id, user_id) 
     DO UPDATE SET 
        role = EXCLUDED.role,
        nickname = EXCLUDED.nickname,
        joined_at = CURRENT_TIMESTAMP,
        left_at = NULL
     RETURNING *`,
    [member.group_id, member.user_id, member.nickname, member.role || "member"],
  );
  return rows[0];
};

const getMembers = async (groupId: string) => {
  const { rows } = await db.raw(
    `SELECT gm.*, u.full_name, u.email, u.avatar 
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = ? AND gm.left_at IS NULL`,
    [groupId],
  );
  return rows;
};

const removeMember = async (groupId: string, userId: string) => {
  await db.raw(
    "UPDATE group_members SET left_at = CURRENT_TIMESTAMP WHERE group_id = ? AND user_id = ?",
    [groupId, userId],
  );
  return true;
};

const isMember = async (groupId: string, userId: string) => {
  const { rows } = await db.raw(
    "SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND left_at IS NULL LIMIT 1",
    [groupId, userId],
  );
  return rows.length > 0;
};

const getMemberRole = async (
  groupId: string,
  userId: string,
): Promise<string | null> => {
  const { rows } = await db.raw(
    "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND left_at IS NULL LIMIT 1",
    [groupId, userId],
  );
  return rows[0]?.role || null;
};

const getGroupWithMembers = async (groupId: string) => {
  const { rows } = await db.raw(
    `SELECT 
       g.*,
       COALESCE(
         json_agg(
           json_build_object(
             'id', gm.id,
             'group_id', gm.group_id,
             'user_id', gm.user_id,
             'role', gm.role,
             'nickname', gm.nickname,
             'joined_at', gm.joined_at,
             'left_at', gm.left_at,
             'user', u.*
           )
         ) FILTER (WHERE gm.id IS NOT NULL),
         '[]'
       ) as members
     FROM groups g
     LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.left_at IS NULL
     LEFT JOIN users u ON gm.user_id = u.id
     WHERE g.id = ?
     GROUP BY g.id`,
    [groupId],
  );
  return rows[0] || null;
};

const hasUnverifiedExpenses = async (groupId: string): Promise<boolean> => {
  const { rows } = await db.raw(
    `SELECT 1 FROM expenses WHERE group_id = ? AND expense_status != ? LIMIT 1`,
    [groupId, EXPENSE_STATUS.VERIFIED],
  );
  return rows.length > 0;
};

const hasPendingSettlements = async (
  groupId: string,
  userId: string,
): Promise<boolean> => {
  // 1. Check for any splits not yet linked to a settlement (either owing or owed)
  // Only verified expenses create actionable debt
  const unlinkedSplits = await db.raw(
    `SELECT 1 FROM expense_splits es
     JOIN expenses e ON es.expense_id = e.id
     WHERE e.group_id = ? 
     AND es.settlement_id IS NULL 
     AND es.user_id != e.paid_by
     AND e.expense_status = ?
     AND (es.user_id = ? OR e.paid_by = ?)
     LIMIT 1`,
    [groupId, EXPENSE_STATUS.VERIFIED, userId, userId],
  );

  if (unlinkedSplits.rows.length > 0) return true;

  // 2. Check for any active settlements (pending or paid)
  const activeSettlements = await db.raw(
    `SELECT 1 FROM settlements 
     WHERE group_id = ? AND (from_user_id = ? OR to_user_id = ?) 
     AND status IN (?, ?)
     LIMIT 1`,
    [groupId, userId, userId, SETTLEMENT_STATUS.PENDING, SETTLEMENT_STATUS.PAID],
  );

  return activeSettlements.rows.length > 0;
};

const setMemberRole = async (
  groupId: string,
  userId: string,
  role: "admin" | "member",
) => {
  const { rows } = await db.raw(
    "UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ? RETURNING *",
    [role, groupId, userId],
  );
  return rows[0];
};

export const groupDao = {
  createGroup,
  findById,
  findByUserId,
  updateGroup,
  deleteGroup,
  addMember,
  getMembers,
  removeMember,
  isMember,
  getMemberRole,
  getGroupWithMembers,
  hasUnverifiedExpenses,
  hasPendingSettlements,
  setMemberRole,
};
