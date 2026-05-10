import { db } from "../database/db";
import { ISignupInput } from "@expense-tracker/shared/validationSchema";
import { keysToSnakeCase } from "../utils/caseConverter";

interface IRegisterUser extends ISignupInput {
  avatar?: { url: string; publicId: string } | null;
}

const findByEmail = async (email: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0];
};

const findByGoogleId = async (googleId: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw(
    "SELECT * FROM users WHERE google_id = ? LIMIT 1",
    [googleId],
  );
  return rows[0];
};

const findById = async (userId: string): Promise<Auth.IUser> => {
  const { rows } = await db.raw("SELECT * FROM users WHERE id = ? LIMIT 1", [
    userId,
  ]);
  return rows[0];
};

const createUser = async (
  user: IRegisterUser & { googleId?: string },
): Promise<Exclude<Auth.IUser, "password_hash">> => {
  const { fullName, email, phone, password, avatar, googleId } = user;

  const { rows } = await db.raw(
    `INSERT INTO users (id, full_name, email, phone, password_hash, avatar, google_id) 
       VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?) 
       RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [
      fullName || null,
      email || null,
      phone || null,
      password || null,
      avatar ? JSON.stringify(avatar) : null,
      googleId || null,
    ],
  );
  return rows[0].user;
};

const updateProfile = async (
  userId: string,
  updates: Partial<ISignupInput> & {
    avatar?: { url: string; publicId: string } | null;
  },
): Promise<Exclude<Auth.IUser, "password_hash"> | null> => {
  const updatedObj = keysToSnakeCase(updates);

  const keys = Object.keys(updatedObj);

  if (keys.length === 0) return null;

  const setClause = keys
    .map((key) => {
      if (key === "password") {
        return `password_hash = ?`;
      }
      return `${key} = ?`;
    })
    .join(", ");
  const values = [...Object.values(updatedObj), userId];

  const { rows } = await db.raw(
    `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = ? 
       RETURNING to_jsonb(users) - 'password_hash' AS user`,
    values,
  );

  return rows[0].user;
};

export const authDao = {
  findByEmail,
  findByGoogleId,
  findById,
  createUser,
  updateProfile,
};
