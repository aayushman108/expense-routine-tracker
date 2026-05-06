import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.post(
  "/register-token",
  notificationController.registerToken,
);

notificationRouter.delete(
  "/remove-token",
  notificationController.removeToken,
);

notificationRouter.get(
  "/unread-count",
  notificationController.getUnreadCount,
);

notificationRouter.get(
  "/",
  notificationController.getNotifications,
);

notificationRouter.patch(
  "/read-all",
  notificationController.markAllAsRead,
);

notificationRouter.patch(
  "/:id/read",
  notificationController.markAsRead,
);

export { notificationRouter };
