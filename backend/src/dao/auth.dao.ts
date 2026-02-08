import { db } from "../database/db";
import { ISignupInput } from "../schema/auth.schema";
import { keysToSnakeCase } from "../utils/caseConverter";

interface IRegisterUser extends ISignupInput {}

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
  const { fullName, nickname, email, phone, password, profilePicUrl } = user;

  const { rows } = await db.raw(
    `INSERT INTO users (id, full_name, nickname, email, phone, password_hash, profile_pic_url) 
       VALUES (uuid_generate_v4(), ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
    [fullName, nickname, email, phone, password, profilePicUrl],
  );
  return rows[0];
};

const verifyUser = async (email: string) => {
  await db.raw("UPDATE users SET updated_at = NOW() WHERE email = ?", [email]);
  return true;
};

const updateProfile = async (
  userId: string,
  updates: Partial<ISignupInput>,
) => {
  const updatedObj = keysToSnakeCase(updates);

  const keys = Object.keys(updatedObj);

  if (keys.length === 0) return null;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = [...Object.values(updatedObj), userId];

  const { rows } = await db.raw(
    `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = ? 
       RETURNING id, full_name, nickname, email, profile_pic_url`,
    values,
  );

  return rows[0];
};

export const authDao = {
  findByEmail,
  findById,
  createUser,
  verifyUser,
  updateProfile,
};
