import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  // Cloudinary
  CLOUD_NAME: process.env.CLOUD_NAME || "",
  CLOUD_API_KEY: process.env.CLOUD_API_KEY || "",
  CLOUD_SECRET_KEY: process.env.CLOUD_SECRET_KEY || "",
  CLOUD_AVATAR_FOLDER: process.env.CLOUD_AVATAR_FOLDER || "user_avatars",

  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "15d",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET || "",
  EMAIL_VERIFICATION_TOKEN_EXPIRY:
    process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "5m",
  FORGOT_PASSWORD_SECRET: process.env.FORGOT_PASSWORD_SECRET || "",
  FORGOT_PASSWORD_TOKEN_EXPIRY:
    process.env.FORGOT_PASSWORD_TOKEN_EXPIRY || "10m",

  // Node
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "8000",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Email
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "",
  SMTP_SECURE: process.env.SMTP_SECURE || "",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
};
