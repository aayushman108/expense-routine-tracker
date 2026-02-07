import { db } from "../database/db";

interface IRegisterUser {
  full_name: string;
  nickname?: string;
  email: string;
  hashedPassword: string;
}

const findByEmail = async (email: string): Promise<any> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0];
};

const findById = async (userId: string): Promise<any> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE id = ? LIMIT 1", [
    userId,
  ]);
  return rows[0];
};

const createUser = async (user: IRegisterUser) => {
  const { full_name, nickname, email, hashedPassword } = user;

  const { rows } = await db.raw(
    `INSERT INTO users (full_name, nickname, email, password_hash) 
       VALUES (?, ?, ?, ?) 
       RETURNING *`,
    [full_name, nickname || null, email, hashedPassword],
  );
  return rows[0];
};

const verifyUser = async (email: string) => {
  await db.raw("UPDATE users SET updated_at = NOW() WHERE email = ?", [email]);
  return true;
};

const updateProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    nickname?: string;
    email?: string;
    profile_pic_url?: string;
  },
) => {
  const keys = Object.keys(updates);
  if (keys.length === 0) return null;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = [...Object.values(updates), userId];

  const { rows } = await db.raw(
    `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = ? 
       RETURNING id, full_name, nickname, email, profile_pic_url`,
    values,
  );

  return rows[0];
};

export const authDeo = {
  findByEmail,
  findById,
  createUser,
  verifyUser,
  updateProfile,
};
