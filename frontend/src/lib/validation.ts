import { ZodError, ZodSchema } from "zod";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validates data against a Zod schema and returns a structured result.
 * Does NOT throw errors. Catches them and formats them for the UI.
 */
export const validateData = <T>(
  schema: ZodSchema<T>,
  data: unknown,
): ValidationResult<T> => {
  try {
    const parsedData = schema.parse(data);

    return { success: true, data: parsedData as any };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        // Remove "body" from the path
        const path = issue.path.filter((p) => p !== "body");
        const field = path.join(".") || "_global";
        errors[field] = issue.message;
      });

      return { success: false, errors };
    }
    // Unexpected error fallback
    return { success: false, errors: { _global: "Validation failed" } };
  }
};
