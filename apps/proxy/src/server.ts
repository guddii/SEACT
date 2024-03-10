import express from "express";
import type { Express } from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";
import { APPS } from "@seact/core";
import { statusRouter } from "./resources/status/status.router";
import { asyncMiddleware } from "./services/async-middleware.ts";
import { errorHandler } from "./services/error-handler.ts";
import { createLog, createLogInterceptor } from "./utils/create-log.ts";

const proxy = createProxyMiddleware({
  target: APPS.PROXY.forwardingUrl,
  onProxyReq: fixRequestBody,
  selfHandleResponse: true,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Incorrect use is defined in the library
  onProxyRes: responseInterceptor(createLogInterceptor),
});

export const createServer = (): Express => {
  const app = express();
  app
    .use(errorHandler)
    .use(morgan("dev"))
    .use(express.json())
    .use(express.urlencoded())
    .use("/status", statusRouter)
    .use(asyncMiddleware(createLog))
    .use(proxy);

  return app;
};
