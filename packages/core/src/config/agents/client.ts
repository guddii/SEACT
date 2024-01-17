import process from "node:process";
import { PROXY } from "../apps/proxy";
import { SolidAgent } from "../../models/solid-agent";

export const CLIENT = new SolidAgent({
  webId:
    process.env.CLIENT_WEB_ID || "http://localhost:4000/client/profile/card#me",
  storage: process.env.CLIENT_STORAGE || "http://localhost:4000/client",
  clientId: process.env.CLIENT_ID || undefined,
  clientSecret: process.env.CLIENT_SECRET || undefined,
  provider: PROXY,
});
