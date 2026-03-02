import express from "express";
import { paymentMethodController } from "../controllers/payment-method.controller";

export const paymentMethodRouter = express.Router();

paymentMethodRouter.get("/", paymentMethodController.getPaymentMethods);
paymentMethodRouter.post("/", paymentMethodController.createPaymentMethod);
paymentMethodRouter.patch("/:id", paymentMethodController.updatePaymentMethod);
paymentMethodRouter.delete("/:id", paymentMethodController.deletePaymentMethod);
