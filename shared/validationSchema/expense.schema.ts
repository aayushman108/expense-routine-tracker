import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
} from "../utils/validationSchemaPreprocessor";

export class ExpenseValidation {
  static createExpenseSchema = z
    .object({
      params: z.object({
        groupId: z.string().uuid().optional(),
      }),
      body: z.object({
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
            .positive("Amount must be positive"),
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
                splitRatio: z.number().int().positive(),
              }),
            )
            .optional(),
        ),
      }),
    })
    .superRefine((data, ctx) => {
      const groupId = data?.params?.groupId;
      const splits = data?.body?.splits;
      if (groupId && (!splits || splits.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Splits are required for group expenses",
          path: ["splits"],
        });
      }
    });

  static updateExpenseSchema = z.object({
    body: z
      .object({
        description: z.preprocess(
          optionalPreprocessor,
          z.string().min(1).optional().nullable(),
        ),
        totalAmount: z.preprocess(
          optionalPreprocessor,
          z.number().positive().optional().nullable(),
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
                splitRatio: z.number().int().positive(),
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
}

export type ICreateExpenseSchema = z.infer<
  typeof ExpenseValidation.createExpenseSchema
>;
export type IUpdateExpenseSchema = z.infer<
  typeof ExpenseValidation.updateExpenseSchema
>;
