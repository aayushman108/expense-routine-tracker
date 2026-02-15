import { db } from "../database/db";
import {
  ICreateGroupInput,
  IUpdateGroupInput,
} from "@expense-tracker/shared/validationSchema";
import { keysToSnakeCase } from "../utils/caseConverter";

export interface IGroup {
  id: string;
  name: string;
  description: string | null;
  image: { url: string; publicId: string } | null;
  created_by: string;
  created_at: Date;
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
    `SELECT g.* FROM groups g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = ? AND gm.left_at IS NULL
     ORDER BY g.created_at DESC`,
    [userId],
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
};
