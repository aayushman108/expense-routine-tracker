import { Router } from "express";
import { validateRequest } from "../middlewares";
import { ExpenseValidation } from "@expense-tracker/shared/validationSchema";
import { expenseController } from "../controllers";

const router = Router();

router.post(
  "/",
  validateRequest(ExpenseValidation.createExpenseSchema),
  expenseController.createExpense,
);
router.get("/user", expenseController.getUserExpenses);
router.get("/group/:groupId", expenseController.getGroupExpenses);
router.get("/:id", expenseController.getExpense);
router.delete("/:id", expenseController.deleteExpense);

export { router as expenseRouter };
