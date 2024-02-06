import process from "node:process";
import { PROXY } from "../apps/proxy";
import { Agent } from "../../models/agent.ts";

export const CLIENT = new Agent({
  webId:
    process.env.CLIENT_WEB_ID || "http://proxy.localhost:4000/client/profile/card#me",
  storage: process.env.CLIENT_STORAGE || "http://proxy.localhost:4000/client",
  clientId: process.env.CLIENT_ID || undefined,
  clientSecret: process.env.CLIENT_SECRET || undefined,
  provider: PROXY,
});
