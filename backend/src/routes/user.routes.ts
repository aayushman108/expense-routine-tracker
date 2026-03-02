import express from "express";
import { userController } from "../controllers";

export const userRouter = express.Router();

userRouter.put("/profile", userController.updateProfile);
userRouter.get("/", userController.searchUser);
userRouter.get("/:id/profile", userController.getUserProfile);
