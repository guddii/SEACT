import express, { type Express } from "express";
import morgan from "morgan";
import { proxy } from "./proxy";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    })
    .use(proxy({}));

  return app;
};
