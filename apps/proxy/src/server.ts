import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { APPS } from "@seact/core";
import { createLog } from "./utils/create-log";
import { statusRouter } from "./resources/status/status.router";
import { asyncMiddleware } from "./services/async-middleware.ts";
import { errorHandler } from "./services/error-handler.ts";

const beforeForwarding = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await createLog(req, res, next);
  next();
};

const proxy = createProxyMiddleware({
  target: APPS.PROXY.forwardingUrl,
});

export const createServer = (): Express => {
  const app = express();
  app
    .use(errorHandler)
    .use(morgan("dev"))
    .use("/status", statusRouter)
    .use(asyncMiddleware(beforeForwarding))
    .use(proxy);

  return app;
};
