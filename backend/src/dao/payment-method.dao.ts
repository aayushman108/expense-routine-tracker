import { db } from "../database/db";

const findByUserId = async (userId: string) => {
  const { rows } = await db.raw(
    `SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
    [userId],
  );
  return rows;
};

const findById = async (id: string, userId: string) => {
  const { rows } = await db.raw(
    `SELECT * FROM payment_methods WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return rows[0];
};

const create = async (
  userId: string,
  data: {
    provider: string;
    metadata?: Record<string, unknown>;
    isDefault?: boolean;
  },
) => {
  const { provider, metadata, isDefault } = data;

  // If this is set as default, unset all other defaults first
  if (isDefault) {
    await db.raw(
      `UPDATE payment_methods SET is_default = FALSE, updated_at = NOW() WHERE user_id = ?`,
      [userId],
    );
  }

  const { rows } = await db.raw(
    `INSERT INTO payment_methods (id, user_id, provider, metadata, is_default)
     VALUES (gen_random_uuid(), ?, ?, ?, ?)
     RETURNING *`,
    [
      userId,
      provider,
      metadata ? JSON.stringify(metadata) : null,
      isDefault || false,
    ],
  );
  return rows[0];
};

const update = async (
  id: string,
  userId: string,
  data: {
    provider?: string;
    metadata?: Record<string, unknown>;
    isDefault?: boolean;
    isVerified?: boolean;
  },
) => {
  // If setting as default, unset all other defaults first
  if (data.isDefault) {
    await db.raw(
      `UPDATE payment_methods SET is_default = FALSE, updated_at = NOW() WHERE user_id = ?`,
      [userId],
    );
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.provider !== undefined) {
    updates.push("provider = ?");
    values.push(data.provider);
  }
  if (data.metadata !== undefined) {
    updates.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.isDefault !== undefined) {
    updates.push("is_default = ?");
    values.push(data.isDefault);
  }
  if (data.isVerified !== undefined) {
    updates.push("is_verified = ?");
    values.push(data.isVerified);
  }

  if (updates.length === 0) return null;

  updates.push("updated_at = NOW()");
  values.push(id, userId);

  const { rows } = await db.raw(
    `UPDATE payment_methods
     SET ${updates.join(", ")}
     WHERE id = ? AND user_id = ?
     RETURNING *`,
    values,
  );
  return rows[0];
};

const remove = async (id: string, userId: string) => {
  const { rows } = await db.raw(
    `DELETE FROM payment_methods WHERE id = ? AND user_id = ? RETURNING *`,
    [id, userId],
  );
  return rows[0];
};

export const paymentMethodDao = {
  findByUserId,
  findById,
  create,
  update,
  remove,
};
