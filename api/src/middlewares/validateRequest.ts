import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

type RequestSource = "body" | "query" | "params";

export const validateRequest =
  (schema: ZodType, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[source] = result.data;
    next();
  };
