import { Request, Response } from "express";
import { expenseService } from "../services/expense.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";
import { generatePaginationObj } from "src/utils";

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
  const { page, limit } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const pageOffset = Number((pageNumber - 1) * pageLimit);

  const expenses = await expenseService.getGroupExpenses(
    groupId,
    req.userId as string,
    pageLimit,
    pageOffset,
  );

  const { total, data } = expenses;

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });
  return sendSuccessResponse(res, {
    data: {
      data,
      pagination,
    },
    message: "Group expenses fetched successfully",
  });
});

const getUserExpenses = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const { page, limit } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const pageOffset = Number((pageNumber - 1) * pageLimit);

  const { total, data } = await expenseService.getPersonalExpenses(
    userId,
    pageLimit,
    pageOffset,
  );

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    data: {
      data,
      pagination,
    },
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

const updateSplitStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id: expenseId, splitId } = req.params;
  const { status } = req.body;
  const userId = req.userId as string; // or ensure only the assigned user can update it? For now, using req.userId

  const newStatus = await expenseService.updateSplitStatus(
    expenseId,
    splitId,
    status as any,
    userId,
  );

  return sendSuccessResponse(res, {
    message: `Split status updated successfully. Expense is now ${newStatus}.`,
  });
});

export const expenseController = {
  createExpense,
  updateExpense,
  getExpense,
  getGroupExpenses,
  getUserExpenses,
  deleteExpense,
  updateSplitStatus,
};
