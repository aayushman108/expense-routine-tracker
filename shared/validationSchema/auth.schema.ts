import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
  emailPreprocessor,
} from "../utils/validationSchemaPreprocessor";

export class UserValidation {
  static signupSchema = z.object({
    body: z.object({
      fullName: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Full name is required" })
          .min(1, { message: "Full name is required" })
          .max(255, { message: "Full name must not exceed 255 characters" }),
      ),

      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" })
          .max(255, { message: "Email must not exceed 255 characters" }),
      ),
      phone: z.preprocess(
        optionalPreprocessor,
        z
          .string()
          .max(20, { message: "Phone number must not exceed 20 characters" })
          .nullable(),
      ),
      password: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Password is required" })
          .min(8, { message: "Password must be at least 8 characters" })
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            {
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
            },
          ),
      ),
    }),
  });

  static loginSchema = z.object({
    body: z.object({
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" }),
      ),
      password: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Password is required" })
          .min(8, { message: "Password must be at least 8 characters" })
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            {
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
            },
          ),
      ),
    }),
  });

  static forgotPasswordSchema = z.object({
    body: z.object({
      email: z.preprocess(
        emailPreprocessor,
        z
          .string({ message: "Email is required" })
          .email({ message: "Invalid email format" }),
      ),
    }),
  });

  static resetPasswordSchema = z.object({
    body: z.object({
      token: z.preprocess(
        requiredPreprocessor,
        z.string({ message: "Token is required" }),
      ),
      password: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Password is required" })
          .min(8, { message: "Password must be at least 8 characters" })
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            {
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
            },
          ),
      ),
    }),
  });

  static changePasswordSchema = z.object({
    body: z
      .object({
        oldPassword: z.preprocess(
          requiredPreprocessor,
          z.string({ message: "Old password is required" }),
        ),
        newPassword: z.preprocess(
          requiredPreprocessor,
          z
            .string({ message: "New password is required" })
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
              {
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
              },
            ),
        ),
        confirmPassword: z.preprocess(
          requiredPreprocessor,
          z.string({ message: "Confirmation is required" }),
        ),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  });
}

export type ISignupInput = z.infer<
  typeof UserValidation.signupSchema.shape.body
>;
export type ILoginInput = z.infer<typeof UserValidation.loginSchema.shape.body>;
export type IForgotPasswordInput = z.infer<
  typeof UserValidation.forgotPasswordSchema.shape.body
>;
export type IResetPasswordInput = z.infer<
  typeof UserValidation.resetPasswordSchema.shape.body
>;
export type IChangePasswordInput = z.infer<
  typeof UserValidation.changePasswordSchema.shape.body
>;
