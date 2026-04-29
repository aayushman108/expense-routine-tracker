import { Request, Response } from "express";
import { expenseService } from "../services/expense.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";
import { generatePaginationObj } from "src/utils";
import { userDao } from "../dao/user.dao";

const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.addExpense({
    ...req.params,
    ...req.body,
    paidBy: req.body?.paidBy ?? req.userId,
  });

  return sendSuccessResponse(res, {
    data: expense,
    message: "Expense created successfully",
    statusCode: 201,
  });
});

const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await expenseService.updateExpense(id, req.userId as string, {
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
  const { page, limit, startDate, endDate, expenseStatus, settlementStatus } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const pageOffset = Number((pageNumber - 1) * pageLimit);

  const expenses = await expenseService.getGroupExpenses(
    groupId,
    req.userId as string,
    pageLimit,
    pageOffset,
    startDate as string,
    endDate as string,
    expenseStatus as string,
    settlementStatus as string,
  );

  const { total, totalAmount, data } = expenses;

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });
  return sendSuccessResponse(res, {
    data: {
      data,
      pagination: {
        ...pagination,
        totalAmount,
      },
    },
    message: "Group expenses fetched successfully",
  });
});

const getUserExpenses = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const { page, limit, startDate, endDate, expenseStatus, settlementStatus, expenseType } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const pageOffset = Number((pageNumber - 1) * pageLimit);

  const { total, totalAmount, data } = await expenseService.getPersonalExpenses(
    userId,
    pageLimit,
    pageOffset,
    startDate as string,
    endDate as string,
    expenseStatus as string,
    settlementStatus as string,
    expenseType as string,
  );

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    data: {
      data,
      pagination: {
        ...pagination,
        totalAmount,
      },
    },
    message: "User expenses fetched successfully",
  });
});

const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const summary = await expenseService.getSummary(userId);

  return sendSuccessResponse(res, {
    data: summary,
    message: "User summary fetched successfully",
  });
});

const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await expenseService.deleteExpense(id, req.userId as string);
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

const getGroupSummaries = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const summaries = await expenseService.getGroupSummaries(userId);

  return sendSuccessResponse(res, {
    data: summaries,
    message: "User group summaries fetched successfully",
  });
});

const getMonthlyAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const analytics = await expenseService.getMonthlyAnalytics(userId);

  return sendSuccessResponse(res, {
    data: analytics,
    message: "Monthly analytics fetched successfully",
  });
});

const downloadStatement = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { startDate, endDate, format, groupId, expenseType } = req.query;

  const user = await userDao.findById(userId);

  return await expenseService.generateExpenseStatement(
    userId,
    res,
    (format as any) || "pdf",
    {
      startDate: startDate as string,
      endDate: endDate as string,
      groupId: groupId as string,
      expenseType: expenseType as string,
      currentUserName: user?.full_name,
    }
  );
});

export const expenseController = {
  createExpense,
  updateExpense,
  getExpense,
  getGroupExpenses,
  getUserExpenses,
  getSummary,
  getGroupSummaries,
  getMonthlyAnalytics,
  deleteExpense,
  updateSplitStatus,
  downloadStatement,
};
