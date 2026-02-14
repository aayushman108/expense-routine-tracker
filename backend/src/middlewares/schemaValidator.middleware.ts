import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { HttpStatusCode } from "../enums/statusCode.enum";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Replacing req.body with parsed data ensures transformations (trim, lowercase) are applied
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.issues[0].message,
        });
      } else {
        next(error);
      }
    }
  };
};
