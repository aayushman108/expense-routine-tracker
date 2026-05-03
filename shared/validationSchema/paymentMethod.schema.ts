import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
  patchPreprocessor,
} from "../utils/validationSchemaPreprocessor";
import { PAYMENT_METHOD_TYPE } from "../enum/payment.enum";

export class PaymentMethodValidation {
  static createPaymentMethodSchema = z
    .object({
      body: z.object({
        provider: z.preprocess(
          requiredPreprocessor,
          z.enum(Object.values(PAYMENT_METHOD_TYPE) as [string, ...string[]], {
            message: "Please select a provider",
          }),
        ),
        metadata: z.preprocess(
          optionalPreprocessor,
          z.record(z.string(), z.string()).optional().default({}),
        ),
        isDefault: z.preprocess(
          optionalPreprocessor,
          z.boolean().optional().default(false),
        ),
      }),
    })
    .superRefine((data, ctx) => {
      const { provider, metadata } = data.body;

      if (!provider) return;

      const checkRequired = (key: string, label: string) => {
        if (!metadata[key] || metadata[key].trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} is required`,
            path: ["body", "metadata", key],
          });
        }
      };

      if (
        [
          PAYMENT_METHOD_TYPE.KHALTI,
          PAYMENT_METHOD_TYPE.ESEWA,
          PAYMENT_METHOD_TYPE.FONEPAY,
          PAYMENT_METHOD_TYPE.IMEPAY,
        ].includes(provider as PAYMENT_METHOD_TYPE)
      ) {
        checkRequired("phone", "Phone Number");
        checkRequired("name", "Account Name");
      } else if (provider === PAYMENT_METHOD_TYPE.BANK) {
        checkRequired("bankName", "Bank Name");
        checkRequired("accountNumber", "Account Number");
        checkRequired("accountHolder", "Account Holder");
      } else if (provider === PAYMENT_METHOD_TYPE.CONNECTIPS) {
        checkRequired("bankName", "Bank Name");
        checkRequired("username", "Username");
      }
    });

  static updatePaymentMethodSchema = z
    .object({
      body: z.object({
        provider: z.preprocess(
          patchPreprocessor,
          z
            .enum(Object.values(PAYMENT_METHOD_TYPE) as [string, ...string[]])
            .optional(),
        ),
        metadata: z.preprocess(
          patchPreprocessor,
          z.record(z.string(), z.string()).optional(),
        ),
        isDefault: z.preprocess(patchPreprocessor, z.boolean().optional()),
      }),
    })
    .superRefine((data, ctx) => {
      const { provider, metadata } = data.body;

      // Only validate metadata if provider is present (in PATCH, provider might be missing)
      if (!provider || !metadata) return;

      const checkRequired = (key: string, label: string) => {
        if (!metadata[key] || metadata[key].trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} is required`,
            path: ["body", "metadata", key],
          });
        }
      };

      if (
        [
          PAYMENT_METHOD_TYPE.KHALTI,
          PAYMENT_METHOD_TYPE.ESEWA,
          PAYMENT_METHOD_TYPE.FONEPAY,
          PAYMENT_METHOD_TYPE.IMEPAY,
        ].includes(provider as PAYMENT_METHOD_TYPE)
      ) {
        checkRequired("phone", "Phone Number");
        checkRequired("name", "Account Name");
      } else if (provider === PAYMENT_METHOD_TYPE.BANK) {
        checkRequired("bankName", "Bank Name");
        checkRequired("accountNumber", "Account Number");
        checkRequired("accountHolder", "Account Holder");
      } else if (provider === PAYMENT_METHOD_TYPE.CONNECTIPS) {
        checkRequired("bankName", "Bank Name");
        checkRequired("username", "Username");
      }
    });
}

export type ICreatePaymentMethodSchema = z.infer<
  typeof PaymentMethodValidation.createPaymentMethodSchema
>;
export type IUpdatePaymentMethodSchema = z.infer<
  typeof PaymentMethodValidation.updatePaymentMethodSchema
>;
