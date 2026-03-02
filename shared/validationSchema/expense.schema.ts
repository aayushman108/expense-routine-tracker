import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
} from "../utils/validationSchemaPreprocessor";
import {
  EXPENSE_TYPE,
  EXPENSE_STATUS,
  SPLIT_STATUS,
} from "../enum/general.enum";

export class ExpenseValidation {
  static createExpenseSchema = z
    .object({
      params: z.object({
        groupId: z.string().uuid().optional(),
      }),
      body: z.object({
        expenseType: z
          .enum([EXPENSE_TYPE.PERSONAL, EXPENSE_TYPE.GROUP])
          .default(EXPENSE_TYPE.GROUP),
        expenseStatus: z
          .enum([EXPENSE_STATUS.DRAFT, EXPENSE_STATUS.SUBMITTED])
          .default(EXPENSE_STATUS.DRAFT),
        description: z.preprocess(
          requiredPreprocessor,
          z
            .string({ message: "Description is required" })
            .min(1, "Description is required"),
        ),
        totalAmount: z.preprocess(
          requiredPreprocessor,
          z
            .number({ message: "Total amount is required" })
            .positive("Amount must be greater than 0"),
        ),
        expenseDate: z.preprocess(
          requiredPreprocessor,
          z
            .string({ message: "Expense date is required" })
            .refine((val) => !isNaN(Date.parse(val)), {
              message: "Invalid date format",
            }),
        ),
        paidBy: z.preprocess(
          optionalPreprocessor,
          z.string().uuid().nullable(),
        ),
        currency: z.preprocess(
          optionalPreprocessor,
          z.string().length(3).default("NPR"),
        ),
        splits: z.preprocess(
          optionalPreprocessor,
          z
            .array(
              z.object({
                userId: z.string().uuid(),
                splitPercentage: z
                  .number()
                  .min(0, "Percentage must be at least 0")
                  .max(100, "Percentage cannot exceed 100"),
                splitAmount: z
                  .number()
                  .nonnegative("Amount cannot be negative"),
              }),
            )
            .optional(),
        ),
      }),
    })
    .superRefine((data, ctx) => {
      const groupId = data?.params?.groupId;
      const expenseType = data?.body?.expenseType;
      const splits = data?.body?.splits;

      if (expenseType === EXPENSE_TYPE.GROUP && !groupId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Group ID is required for group expenses",
          path: ["params", "groupId"],
        });
      }

      if (expenseType === EXPENSE_TYPE.PERSONAL && groupId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Group ID should not be provided for personal expenses",
          path: ["params", "groupId"],
        });
      }

      if (
        expenseType === EXPENSE_TYPE.GROUP &&
        (!splits || splits.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Splits are required for group expenses",
          path: ["body", "splits"],
        });
      }
    });

  static updateExpenseSchema = z.object({
    body: z
      .object({
        expenseType: z
          .enum([EXPENSE_TYPE.PERSONAL, EXPENSE_TYPE.GROUP])
          .optional(),
        expenseStatus: z
          .enum([
            EXPENSE_STATUS.DRAFT,
            EXPENSE_STATUS.SUBMITTED,
            EXPENSE_STATUS.VERIFIED,
            EXPENSE_STATUS.REJECTED,
          ])
          .optional(),
        description: z.preprocess(
          optionalPreprocessor,
          z.string().min(1).optional().nullable(),
        ),
        totalAmount: z.preprocess(
          optionalPreprocessor,
          z
            .number()
            .positive("Amount must be greater than 0")
            .optional()
            .nullable(),
        ),
        expenseDate: z.preprocess(
          optionalPreprocessor,
          z
            .string()
            .refine((val) => !isNaN(Date.parse(val)))
            .optional()
            .nullable(),
        ),
        currency: z.preprocess(
          optionalPreprocessor,
          z.string().length(3).optional().nullable(),
        ),
        paidBy: z.preprocess(
          optionalPreprocessor,
          z.string().uuid().nullable(),
        ),
        splits: z.preprocess(
          optionalPreprocessor,
          z
            .array(
              z.object({
                userId: z.string().uuid(),
                splitPercentage: z
                  .number()
                  .min(0, "Percentage must be at least 0")
                  .max(100, "Percentage cannot exceed 100"),
                splitAmount: z
                  .number()
                  .nonnegative("Amount cannot be negative"),
              }),
            )
            .optional(),
        ),
      })
      .superRefine((data, ctx) => {
        // If splits exist, totalAmount must exist
        if (data.splits?.length && !data.totalAmount) {
          ctx.addIssue({
            path: ["totalAmount"],
            message: "Total amount is required when splits are provided",
            code: z.ZodIssueCode.custom,
          });
        }
      }),
  });

  static updateSplitStatusSchema = z.object({
    params: z.object({
      id: z.string().uuid(),
      splitId: z.string().uuid(),
    }),
    body: z.object({
      status: z.enum([
        SPLIT_STATUS.PENDING,
        SPLIT_STATUS.VERIFIED,
        SPLIT_STATUS.REJECTED,
      ]),
    }),
  });
}

export type ICreateExpenseSchema = z.infer<
  typeof ExpenseValidation.createExpenseSchema
>;
export type IUpdateExpenseSchema = z.infer<
  typeof ExpenseValidation.updateExpenseSchema
>;
