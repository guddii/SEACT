import type { Request, Response, NextFunction } from "express";

export type AsyncMiddlewareFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncMiddleware = (fn: AsyncMiddlewareFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
