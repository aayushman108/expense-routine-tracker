import { Request, Response } from "express";
import { notificationDao } from "../dao/notification.dao";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";
import { BaseError } from "../utils/baseError.util";
import { HttpStatusCode } from "../enums/statusCode.enum";

/**
 * POST /api/notifications/register-token
 * Save the FCM token for the authenticated user.
 */
const registerToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    throw new BaseError(HttpStatusCode.BAD_REQUEST, "FCM token is required");
  }

  await notificationDao.saveToken(userId, token);

  return sendSuccessResponse(res, {
    message: "Token registered successfully",
  });
});

/**
 * DELETE /api/notifications/remove-token
 * Remove a specific FCM token (e.g., on logout).
 */
const removeToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    throw new BaseError(HttpStatusCode.BAD_REQUEST, "FCM token is required");
  }

  await notificationDao.removeToken(token);

  return sendSuccessResponse(res, {
    message: "Token removed successfully",
  });
});

/**
 * GET /api/notifications
 * Fetch the authenticated user's notification history.
 */
const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  const notifications = await notificationDao.getUserNotifications(userId, limit, offset);

  return sendSuccessResponse(res, {
    data: notifications,
    message: "Notifications fetched successfully",
  });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read.
 */
const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { id } = req.params;

  await notificationDao.markAsRead(id, userId);

  return sendSuccessResponse(res, {
    message: "Notification marked as read",
  });
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;

  await notificationDao.markAllAsRead(userId);

  return sendSuccessResponse(res, {
    message: "All notifications marked as read",
  });
});

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user.
 */
const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const count = await notificationDao.getUnreadCount(userId);

  return sendSuccessResponse(res, {
    data: { count },
    message: "Unread count fetched successfully",
  });
});

export const notificationController = {
  registerToken,
  removeToken,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
