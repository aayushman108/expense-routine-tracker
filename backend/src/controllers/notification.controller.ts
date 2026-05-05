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
  const notifications = await notificationDao.getUserNotifications(userId);

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

export const notificationController = {
  registerToken,
  removeToken,
  getNotifications,
  markAsRead,
};
