import express from "express";
import { authController } from "../controllers";
import { uploadMiddleware, validateRequest, verifyJWT } from "../middlewares";
import { UserValidation } from "../schema";
import { singleImageUpload } from "../middlewares/singleImageUpload.middleware";

export const authRouter = express.Router();

// const upload = uploadMiddleware("avatars");

authRouter.post(
  "/signup",
  validateRequest(UserValidation.signupSchema),
  authController.signup
);

authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post(
  "/login",
  validateRequest(UserValidation.loginSchema),
  authController.login
);
authRouter.get("/refresh", authController.refresh);
authRouter.get("/logout", verifyJWT, authController.logout);
authRouter.patch(
  "/update-profile",
  verifyJWT,
  singleImageUpload,
  authController.updateProfile
);
