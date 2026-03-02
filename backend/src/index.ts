import express from "express";
import cors from "cors";
import {
  authRouter,
  expenseRouter,
  groupRouter,
  userRouter,
  settlementRouter,
  paymentMethodRouter,
} from "./routes";
import { errorHandler, verifyJWT } from "./middlewares";
import cookieParser from "cookie-parser";
import "./config/cloudinary.config";
import { db } from "./database/db";
import { ENV } from "./constants";
import { initEmailListeners } from "./listeners/email.listener";

// Initialize Listeners
initEmailListeners();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

/**
 * It handles requests with the Content-Type: application/x-www-form-urlencoded header.
 *
 * extended: false -> Uses querystring (Node.js built-in library) (Supported structure: Only strings and arrays)
 * eg. name=Aayushman&age=25
 *
 * extended: true -> Uses qs library (supports rich parsing) (Supported structure: Strings, arrays, objects, nested objects)
 * eg. user[name]=Aayushman&user[age]=25
 */
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

/**
 * It handles requests with the Content-Type: application/json header.
 * eg. {"name": "Aayushman", "age": 25}
 */
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use(verifyJWT);

app.use("/api/expenses", expenseRouter);
app.use("/api/groups", groupRouter);
app.use("/api/users", userRouter);
app.use("/api/settlements", settlementRouter);
app.use("/api/payment-methods", paymentMethodRouter);

app.use(errorHandler);

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    // Verify database connection
    await db.raw("SELECT 1");
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
