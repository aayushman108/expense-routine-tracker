import { expenseDao, IExpenseSplit } from "../dao/expense.dao";
import {
  ICreateExpenseSchema,
  IUpdateExpenseSchema,
} from "@expense-tracker/shared/validationSchema";
import {
  EXPENSE_STATUS,
  EXPENSE_TYPE,
  REPORT_TYPE,
  SPLIT_STATUS,
} from "@expense-tracker/shared";
import { appEmitter, EVENTS } from "../utils/emitter.util";
import { keysToSnakeCase } from "../utils/caseConverter";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { Response } from "express";
import { BaseError } from "../utils/baseError.util";
import { HttpStatusCode } from "../enums/statusCode.enum";

export type IAddExpense = ICreateExpenseSchema["body"] &
  ICreateExpenseSchema["params"] & {
    paidBy: string;
  };

export type IUpdateExpense = IUpdateExpenseSchema["body"];

async function addExpense(data: IAddExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  // Personal expenses don't need splits or settlement tracking
  if (
    data.expenseType !== EXPENSE_TYPE.PERSONAL &&
    data.splits &&
    data.splits.length > 0
  ) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount,
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.split_amount,
      0,
    );
    const diff = Number((data.totalAmount - sumCalculated).toFixed(2));

    if (Math.round(sumCalculated) !== Math.round(data.totalAmount)) {
      throw new BaseError(
        HttpStatusCode.BAD_REQUEST,
        `Sum of splits (रू ${Math.round(sumCalculated)}) must match total amount (रू ${Math.round(data.totalAmount)})`,
      );
    }

    if (diff !== 0) {
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === data.paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].split_amount = Number(
          (calculatedSplits[findIndex].split_amount + diff).toFixed(2),
        );
      }
    }
  }

  delete data.splits;

  // Personal expenses are auto-verified — no approval workflow needed
  if (data.expenseType === EXPENSE_TYPE.PERSONAL) {
    (data as any).expenseStatus = EXPENSE_STATUS.VERIFIED;
  }

  const newExpense = await expenseDao.createExpense({
    data,
    splits: calculatedSplits,
  });

  if (data.expenseType === EXPENSE_TYPE.GROUP && data.groupId) {
    appEmitter.emit(EVENTS.NOTIFICATION.EXPENSE_CREATED, {
      groupId: data.groupId,
      payerId: data.paidBy,
      totalAmount: data.totalAmount,
      description: data.description,
      currency: data.currency || "NPR",
    });
  }

  return newExpense;
}

async function updateExpense(id: string, userId: string, data: IUpdateExpense) {
  let calculatedSplits: IExpenseSplit[] = [];

  // 1. Calculate new splits if totalAmount or splits are changed
  const totalAmount = data?.totalAmount;

  if (data.splits && data.splits.length > 0 && totalAmount) {
    calculatedSplits = data.splits.map((split) => ({
      user_id: split.userId,
      split_percentage: split.splitPercentage,
      split_amount: split.splitAmount as number,
    }));

    const sumCalculated = calculatedSplits.reduce(
      (acc, s) => acc + s.split_amount,
      0,
    );
    const diff = Number((totalAmount - sumCalculated).toFixed(2));

    if (Math.round(sumCalculated) !== Math.round(totalAmount)) {
      throw new BaseError(
        HttpStatusCode.BAD_REQUEST,
        `Sum of splits (रू ${Math.round(sumCalculated)}) must match total amount (रू ${Math.round(totalAmount)})`,
      );
    }

    if (diff !== 0) {
      const paidBy = data?.paidBy ?? userId;
      const findIndex = calculatedSplits.findIndex(
        (split) => split.user_id === paidBy,
      );
      if (findIndex !== -1) {
        calculatedSplits[findIndex].split_amount = Number(
          (calculatedSplits[findIndex].split_amount + diff).toFixed(2),
        );
      }
    }
  }

  delete data.splits;

  const updatedExpense = await expenseDao.updateExpense({
    expenseId: id,
    userId,
    data,
    splits: calculatedSplits,
  });

  if (updatedExpense && updatedExpense.expense_type === EXPENSE_TYPE.GROUP) {
    appEmitter.emit(EVENTS.NOTIFICATION.EXPENSE_UPDATED, {
      groupId: updatedExpense.group_id,
      updaterId: userId,
      expenseId: updatedExpense.id,
      description: updatedExpense.description,
    });
  }

  return updatedExpense;
}

async function getExpenseDetails(id: string) {
  return await expenseDao.getExpenseById(id);
}

async function getGroupExpenses(
  groupId: string,
  userId: string,
  limit: number,
  offset: number,
  startDate?: string,
  endDate?: string,
  expenseStatus?: string,
  settlementStatus?: string,
) {
  return await expenseDao.getGroupExpenses(
    groupId,
    userId,
    limit,
    offset,
    startDate,
    endDate,
    expenseStatus,
    settlementStatus,
  );
}

async function getPersonalExpenses(
  userId: string,
  limit: number,
  offset: number,
  startDate?: string,
  endDate?: string,
  expenseStatus?: string,
  settlementStatus?: string,
  expenseType?: string,
) {
  return await expenseDao.getUserExpenses(
    userId,
    limit,
    offset,
    startDate,
    endDate,
    expenseStatus,
    settlementStatus,
    expenseType,
  );
}

async function deleteExpense(id: string, userId: string) {
  const expense = await expenseDao.getExpenseById(id);
  const result = await expenseDao.deleteExpense(id, userId);

  if (result && expense && expense.expense_type === EXPENSE_TYPE.GROUP) {
    appEmitter.emit(EVENTS.NOTIFICATION.EXPENSE_DELETED, {
      groupId: expense.group_id,
      deleterId: userId,
      description: expense.description,
    });
  }

  return result;
}

async function updateSplitStatus(
  expenseId: string,
  splitId: string,
  splitStatus: SPLIT_STATUS,
  userId: string,
) {
  const newExpenseStatus = await expenseDao.updateSplitStatus(
    expenseId,
    splitId,
    splitStatus,
    userId,
  );

  if (newExpenseStatus === EXPENSE_STATUS.VERIFIED) {
    // We need to fetch expense details to send the email
    const expense = await expenseDao.getExpenseById(expenseId);
    if (expense) {
      const splits =
        typeof expense.splits === "string"
          ? JSON.parse(expense.splits)
          : expense.splits;
      const emails = splits.map((s: any) => s.user.email).filter(Boolean);
      const payerName = expense.payer?.full_name || "Someone";
      appEmitter.emit(EVENTS.EMAIL.EXPENSE_VERIFIED, {
        emails,
        payerName,
        expenseDescription: expense.description,
        totalAmount: expense.total_amount,
        currency: expense.currency || "NPR",
      });

      appEmitter.emit(EVENTS.NOTIFICATION.EXPENSE_VERIFIED, {
        groupId: expense.group_id,
        expenseId: expense.id,
        description: expense.description,
        payerId: expense.paid_by,
      });
    }
}

  return newExpenseStatus;
}

async function getUserSummary(userId: string) {
  return await expenseDao.getUserSummary(userId);
}

async function getUserGroupSummaries(userId: string) {
  return await expenseDao.getUserGroupSummaries(userId);
}

async function getMonthlyAnalytics(userId: string) {
  return await expenseDao.getMonthlyAnalytics(userId);
}

async function generateExpenseStatement(
  userId: string,
  res: Response,
  format: "pdf" | "xls",
  options: {
    startDate?: string;
    endDate?: string;
    groupId?: string;
    expenseType?: string;
    currentUserName?: string;
  },
) {
  const { startDate, endDate, groupId, expenseType, currentUserName } = options;
  const expenses = await expenseDao.getUserExpensesForDownload(
    userId,
    startDate,
    endDate,
    groupId,
    expenseType,
  );

  const isPersonal = expenseType === EXPENSE_TYPE.PERSONAL;
  const groupName =
    expenses.length > 0 && expenses[0].group_name
      ? expenses[0].group_name
      : isPersonal
        ? "Personal"
        : "Expense";

  const fileNamePrefix = groupName.replace(/\s+/g, "_").toLowerCase();

  if (format === REPORT_TYPE.PDF) {
    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileNamePrefix}_statement_${Date.now()}.pdf`,
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .text(`${groupName} Expense Statement`, { align: "center" });
    doc
      .fontSize(12)
      .text(`Generated for: ${currentUserName || "User"}`, { align: "center" });
    doc.moveDown();

    if (startDate || endDate) {
      doc
        .fontSize(10)
        .text(`Period: ${startDate || "Start"} to ${endDate || "End"}`, {
          align: "center",
        });
      doc.moveDown();
    }

    // Table Header
    const tableTop = 150;
    doc.fontSize(10).font("Helvetica-Bold");

    doc.text("Date", 50, tableTop);
    doc.text("Description", 120, tableTop);

    if (isPersonal) {
      doc.text("Paid By", 350, tableTop);
      doc.text("Amount", 450, tableTop);
    } else {
      doc.text("Exp Status", 280, tableTop);
      doc.text("Setl Status", 360, tableTop);
      doc.text("Paid By", 440, tableTop);
      doc.text("Total Amount", 540, tableTop);
      doc.text("My Split", 640, tableTop);
    }

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(750, tableTop + 15)
      .stroke();

    // Rows
    let y = tableTop + 25;
    doc.font("Helvetica");

    let totalAmount = 0;
    let totalSplitAmount = 0;

    expenses.forEach((expense: any) => {
      const date = new Date(expense.expense_date).toLocaleDateString();
      const amountValue = Number(expense.user_amount);
      const splitValue = Number(expense.user_split_amount || 0);
      const currency = expense.currency || "NPR";

      const totalAmountStr = `${currency} ${amountValue.toFixed(2)}`;
      const splitAmountStr = `${currency} ${splitValue.toFixed(2)}`;

      const description = expense.description || "No description";
      const payer = expense.payer_name || "Me";
      const expStatus = expense.expense_status || "N/A";
      const setlStatus = expense.settlement_status || "N/A";

      const descriptionHeight = doc.heightOfString(description, { width: 150 });
      const rowHeight = Math.max(descriptionHeight, 20);

      if (y + rowHeight > 550) {
        doc.addPage();
        y = 50;
      }

      totalAmount += amountValue;
      totalSplitAmount += splitValue;

      doc.text(date, 50, y);
      doc.text(description, 120, y, { width: 150 });

      if (isPersonal) {
        doc.text(payer, 350, y);
        doc.text(totalAmountStr, 450, y);
      } else {
        doc.text(expStatus, 280, y);
        doc.text(setlStatus, 360, y);
        doc.text(payer, 440, y);
        doc.text(totalAmountStr, 540, y);
        doc.text(splitAmountStr, 640, y);
      }

      y += rowHeight + 10;
    });

    doc.moveDown();
    doc.moveTo(50, y).lineTo(750, y).stroke();
    y += 10;

    if (isPersonal) {
      doc.font("Helvetica-Bold").text("Total Amount", 350, y);
      doc.text(
        `${expenses[0]?.currency || "NPR"} ${totalAmount.toFixed(2)}`,
        450,
        y,
      );
    } else {
      doc.font("Helvetica-Bold").text("Total", 440, y);
      doc.text(
        `${expenses[0]?.currency || "NPR"} ${totalAmount.toFixed(2)}`,
        540,
        y,
      );
      doc.text(
        `${expenses[0]?.currency || "NPR"} ${totalSplitAmount.toFixed(2)}`,
        640,
        y,
      );
    }

    doc.end();
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    if (isPersonal) {
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Paid By", key: "payer", width: 20 },
        { header: "Currency", key: "currency", width: 10 },
        { header: "Amount", key: "amount", width: 15 },
      ];
    } else {
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Expense Status", key: "expStatus", width: 15 },
        { header: "Settlement Status", key: "setlStatus", width: 15 },
        { header: "Paid By", key: "payer", width: 20 },
        { header: "Currency", key: "currency", width: 10 },
        { header: "Total Amount", key: "amount", width: 15 },
        { header: "My Split", key: "splitAmount", width: 15 },
      ];
    }

    expenses.forEach((expense: any) => {
      const rowData: any = {
        date: new Date(expense.expense_date).toLocaleDateString(),
        description: expense.description,
        payer: expense.payer_name || "Me",
        currency: expense.currency || "NPR",
        amount: Number(expense.user_amount),
      };

      if (!isPersonal) {
        rowData.expStatus = expense.expense_status || "N/A";
        rowData.setlStatus = expense.settlement_status || "N/A";
        rowData.splitAmount = Number(expense.user_split_amount || 0);
      }

      worksheet.addRow(rowData);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileNamePrefix}_statement_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}

export const expenseService = {
  addExpense,
  updateExpense,
  getExpenseDetails,
  getGroupExpenses,
  getPersonalExpenses,
  getSummary: getUserSummary,
  getGroupSummaries: getUserGroupSummaries,
  getMonthlyAnalytics,
  deleteExpense,
  updateSplitStatus,
  generateExpenseStatement,
};
