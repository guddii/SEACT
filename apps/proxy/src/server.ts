import type { IncomingMessage, ServerResponse } from "node:http";
import express from "express";
import type { Express } from "express";
import morgan from "morgan";
import { proxy } from "./services/proxy";
import { ProxySession } from "./services/proxy-session";
import { createLog } from "./helper/create-log";
import { statusRouter } from "./resources/status/status.router";

const onAfterForwarding = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  if (ProxySession.isOwnRequest(req)) {
    await createLog({ req, res });
  }
};

export const createServer = (): Express => {
  const app = express();
  app
    .use(morgan("dev"))
    .use("/status", statusRouter)
    .use(proxy({ onAfterForwarding }));

  return app;
};
