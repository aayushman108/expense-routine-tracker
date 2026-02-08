import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
  emailPreprocessor,
} from "../utils/validationSchemaPreprocessor";

export class UserValidation {
  static signupSchema = z.object({
    fullName: z.preprocess(
      requiredPreprocessor,
      z
        .string({ required_error: "Full name is required" })
        .min(1, { message: "Full name is required" })
        .max(255, { message: "Full name must not exceed 255 characters" }),
    ),
    nickname: z.preprocess(
      optionalPreprocessor,
      z
        .string()
        .max(100, { message: "Nickname must not exceed 100 characters" })
        .nullable(),
    ),
    email: z.preprocess(
      emailPreprocessor,
      z
        .string({ required_error: "Email is required" })
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
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
          message: "Password must contain at least one letter and one number",
        }),
    ),
  });

  static loginSchema = z.object({
    email: z.preprocess(
      emailPreprocessor,
      z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email format" }),
    ),
    password: z.preprocess(
      requiredPreprocessor,
      z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
          message: "Password must contain at least one letter and one number",
        }),
    ),
  });
}

export type ISignupInput = z.infer<typeof UserValidation.signupSchema>;
export type ILoginInput = z.infer<typeof UserValidation.loginSchema>;
