import { db } from "../database/db";

const findByEmailOrName = async (
  query: string,
  excludeUserId: string,
  limit: number = 10,
) => {
  const { rows } = await db.raw(
    `SELECT * 
     FROM users 
     WHERE (email ILIKE ? OR full_name ILIKE ?) 
     AND id != ? 
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, excludeUserId, limit],
  );
  return rows;
};

const findById = async (userId: string) => {
  const { rows } = await db.raw(
    `SELECT id, full_name, email, phone, avatar, created_at, updated_at 
     FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );
  return rows[0];
};

const shareGroup = async (userIdA: string, userIdB: string) => {
  const { rows } = await db.raw(
    `SELECT 1 FROM group_members gm1
     JOIN group_members gm2 ON gm1.group_id = gm2.group_id
     WHERE gm1.user_id = ? AND gm2.user_id = ?
     AND gm1.left_at IS NULL AND gm2.left_at IS NULL
     LIMIT 1`,
    [userIdA, userIdB],
  );
  return rows.length > 0;
};

const updateById = async (userId: string, data: any) => {
  const { rows } = await db.raw(
    `UPDATE users 
     SET 
       full_name = COALESCE(?, full_name),
       phone = COALESCE(?, phone),
       avatar = COALESCE(?, avatar),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ? 
     RETURNING id, full_name, email, phone, avatar, updated_at`,
    [data.full_name || null, data.phone || null, data.avatar || null, userId],
  );
  return rows[0];
};

export const userDao = {
  findByEmailOrName,
  findById,
  shareGroup,
  updateById,
};
