import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authRouter, expenseRouter } from "./routes";
import { errorHandler, verifyJWT } from "./middlewares";
import cookieParser from "cookie-parser";
import "./config/cloudinary.config";

dotenv.config();

const app = express();

/**
 * It handles requests with the Content-Type: application/x-www-form-urlencoded header.
 *
 * extended: false -> Uses querystring (Node.js built-in library) (Supported structure: Only strings and arrays)
 * eg. name=Aayushman&age=25
 *
 * extended: true -> Uses qs library (supports rich parsing) (Supported structure: Strings, arrays, objects, nested objects)
 * eg. user[name]=Aayushman&user[age]=25
 */
app.use(express.urlencoded({ extended: false }));

/**
 * It handles requests with the Content-Type: application/json header.
 * eg. {"name": "Aayushman", "age": 25}
 */
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.use("/api/auth", authRouter);
app.use(verifyJWT);

app.use("/api/expenses", expenseRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
