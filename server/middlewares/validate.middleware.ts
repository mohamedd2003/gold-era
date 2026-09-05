import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType, type infer as ZodInfer } from "zod";
import { UnprocessableEntityError } from "../errors/HttpError";

export interface RequestSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates and coerces request parts against the provided Zod schemas.
 * Parsed (typed) values replace the originals so controllers get clean data.
 */
export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params)
        req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        // Express 5 exposes req.query as a read-only getter; store parsed
        // values on a dedicated property instead of reassigning.
        (req as Request & { validatedQuery?: unknown }).validatedQuery =
          schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(new UnprocessableEntityError("Validation failed", details));
        return;
      }
      next(error);
    }
  };
}

export type Infer<T extends ZodType> = ZodInfer<T>;
