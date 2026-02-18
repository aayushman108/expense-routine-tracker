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

export const userDao = {
  findByEmailOrName,
};
