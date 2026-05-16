import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { fail } from "./responses";

export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({ body: req.body, query: req.query, params: req.params });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(
          res,
          "Validation failed",
          422,
          error.errors.map((item) => ({ path: item.path.join("."), message: item.message }))
        );
      }
      next(error);
    }
  };
