import express from "express";
import { authController } from "../controllers";
import { uploadMiddleware, validateRequest, verifyJWT } from "../middlewares";
import { singleImageUpload } from "../middlewares/singleImageUpload.middleware";
import { UserValidation } from "@expense-tracker/shared/validationSchema";

export const authRouter = express.Router();

const upload = uploadMiddleware("avatars");

authRouter.post(
  "/signup",
  validateRequest(UserValidation.signupSchema),
  authController.signup,
);

authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post(
  "/login",
  validateRequest(UserValidation.loginSchema),
  authController.login,
);
authRouter.post(
  "/forgot-password",
  validateRequest(UserValidation.forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateRequest(UserValidation.resetPasswordSchema),
  authController.resetPassword,
);
authRouter.post(
  "/change-password",
  verifyJWT,
  validateRequest(UserValidation.changePasswordSchema),
  authController.changePassword,
);
authRouter.get("/me", verifyJWT, authController.getMe);
authRouter.get("/refresh", authController.refresh);
authRouter.get("/logout", verifyJWT, authController.logout);
authRouter.patch("/update-profile", verifyJWT, authController.updateProfile);
authRouter.patch(
  "/upload-avatar",
  verifyJWT,
  singleImageUpload,
  authController.uploadAvatar,
);
