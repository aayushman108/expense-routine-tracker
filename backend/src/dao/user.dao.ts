import { IUpdateProfileInput } from "@expense-tracker/shared";
import { db } from "../database/db";

const findByEmailOrName = async (
  query: string,
  excludeUserId: string,
  limit: number = 10,
): Promise<Auth.IUser[]> => {
  const { rows } = await db.raw(
    `SELECT (to_jsonb(u) - 'password_hash') AS user 
     FROM users u
     WHERE (email ILIKE ? OR full_name ILIKE ?) 
     AND id != ? 
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, excludeUserId, limit],
  );
  return rows.map((row: { user: Auth.IUser }) => row.user);
};

const findById = async (userId: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw(
    `SELECT (to_jsonb(u) - 'password_hash') AS user 
     FROM users u
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  return rows[0]?.user;
};

const shareGroup = async (
  userIdA: string,
  userIdB: string,
): Promise<boolean> => {
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

const updateById = async (
  userId: string,
  data: IUpdateProfileInput,
): Promise<Auth.IUser> => {
  const { rows } = await db.raw(
    `UPDATE users u
     SET 
       full_name = COALESCE(?, u.full_name),
       phone = COALESCE(?, u.phone),
       updated_at = CURRENT_TIMESTAMP
     WHERE u.id = ? 
     RETURNING (to_jsonb(u) - 'password_hash') AS user`,
    [data.fullName, data.phone, userId],
  );
  return rows[0]?.user;
};

const findByIdWithPaymentMethods = async (
  userId: string,
): Promise<{ user: Auth.IUser; paymentMethods: any[] } | null> => {
  const { rows } = await db.raw(
    `SELECT 
       (to_jsonb(u) - 'password_hash') AS user,
       COALESCE(
         (SELECT json_agg(pm) FROM (SELECT * FROM payment_methods WHERE user_id = u.id ORDER BY is_default DESC, created_at DESC) pm),
         '[]'::json
       ) AS "paymentMethods"
     FROM users u
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
};

export const userDao = {
  findByEmailOrName,
  findById,
  findByIdWithPaymentMethods,
  shareGroup,
  updateById,
};
