import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️  WARNING: DATABASE_URL is not set in production environment!",
  );
}

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

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_USER: process.env.RESEND_USER || "",

  // Node
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "8000",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",
  // Backend URL for self-pinging
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
};
