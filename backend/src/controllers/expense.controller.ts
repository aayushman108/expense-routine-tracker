import { Request, Response } from "express";
import { expenseService } from "../services/expense.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";

const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.addExpense({
    paidBy: req.userId,
    ...req.params,
    ...req.body,
  });

  return sendSuccessResponse(res, {
    data: expense,
    message: "Expense created successfully",
    statusCode: 201,
  });
});

const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await expenseService.updateExpense(id, {
    ...req.body,
  });
  return sendSuccessResponse(res, {
    data: expense,
    message: "Expense updated successfully",
  });
});

const getExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await expenseService.getExpenseDetails(id);
  return sendSuccessResponse(res, {
    data: expense,
    message: "Expense fetched successfully",
  });
});

const getGroupExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const expenses = await expenseService.getGroupExpenses(groupId);
  return sendSuccessResponse(res, {
    data: expenses,
    message: "Group expenses fetched successfully",
  });
});

const getUserExpenses = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const expenses = await expenseService.getPersonalExpenses(userId);
  return sendSuccessResponse(res, {
    data: expenses,
    message: "User expenses fetched successfully",
  });
});

const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await expenseService.deleteExpense(id);
  return sendSuccessResponse(res, {
    message: "Expense deleted successfully",
  });
});

export const expenseController = {
  createExpense,
  updateExpense,
  getExpense,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
};
