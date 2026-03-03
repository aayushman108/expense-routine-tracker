import express from "express";
import { userController } from "../controllers";
import { UserValidation } from "@expense-tracker/shared";
import { validateRequest } from "../middlewares";

export const userRouter = express.Router();

userRouter.put(
  "/profile",
  validateRequest(UserValidation.updateProfileSchema),
  userController.updateProfile,
);
userRouter.get("/", userController.searchUser);
userRouter.get("/:id/profile", userController.getUserProfile);
