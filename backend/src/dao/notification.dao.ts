import { db } from "../database/db";

/**
 * Save or update an FCM token for a user.
 * Uses UPSERT logic so the same token isn't duplicated.
 */
const saveToken = async (
  userId: string,
  token: string,
): Promise<void> => {
  await db.raw(
    `INSERT INTO fcm_tokens (user_id, token)
     VALUES (?, ?)
     ON CONFLICT (token) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, token],
  );
};

/**
 * Remove a specific FCM token (e.g., on logout).
 */
const removeToken = async (token: string): Promise<void> => {
  await db.raw(`DELETE FROM fcm_tokens WHERE token = ?`, [token]);
};

/**
 * Remove all FCM tokens for a user (e.g., on account deletion).
 */
const removeAllTokensForUser = async (userId: string): Promise<void> => {
  await db.raw(`DELETE FROM fcm_tokens WHERE user_id = ?`, [userId]);
};

/**
 * Get all FCM tokens for a user.
 */
const getTokensByUserId = async (userId: string): Promise<string[]> => {
  const { rows } = await db.raw(
    `SELECT token FROM fcm_tokens WHERE user_id = ?`,
    [userId],
  );
  return rows.map((row: { token: string }) => row.token);
};

/**
 * Get all FCM tokens for multiple users (e.g., group members).
 */
const getTokensByUserIds = async (userIds: string[]): Promise<{ user_id: string; token: string }[]> => {
  if (userIds.length === 0) return [];
  const { rows } = await db.raw(
    `SELECT user_id, token FROM fcm_tokens WHERE user_id = ANY(?)`,
    [userIds],
  );
  return rows;
};

/**
 * Create a new notification record in the database.
 */
const createNotification = async (notification: {
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}): Promise<void> => {
  await db.raw(
    `INSERT INTO notifications (user_id, title, message, type, data)
     VALUES (?, ?, ?, ?, ?)`,
    [
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.data ? JSON.stringify(notification.data) : null,
    ],
  );
};

/**
 * Get all notifications for a specific user.
 */
const getUserNotifications = async (userId: string, limit = 20, offset = 0) => {
  const { rows } = await db.raw(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  return rows;
};

/**
 * Mark a notification as read.
 */
const markAsRead = async (notificationId: string, userId: string) => {
  await db.raw(
    `UPDATE notifications SET is_read = true 
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId],
  );
};

/**
 * Mark all notifications as read for a user.
 */
const markAllAsRead = async (userId: string) => {
  await db.raw(
    `UPDATE notifications SET is_read = true 
     WHERE user_id = ? AND is_read = false`,
    [userId],
  );
};

/**
 * Get the count of unread notifications for a user.
 */
const getUnreadCount = async (userId: string): Promise<number> => {
  const { rows } = await db.raw(
    `SELECT COUNT(*)::int AS count FROM notifications
     WHERE user_id = ? AND is_read = false`,
    [userId],
  );
  return rows[0]?.count ?? 0;
};

export const notificationDao = {
  saveToken,
  removeToken,
  removeAllTokensForUser,
  getTokensByUserId,
  getTokensByUserIds,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
