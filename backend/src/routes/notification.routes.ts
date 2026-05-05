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
  "/",
  notificationController.getNotifications,
);

notificationRouter.patch(
  "/:id/read",
  notificationController.markAsRead,
);

export { notificationRouter };
