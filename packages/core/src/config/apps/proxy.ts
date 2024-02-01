import process from "node:process";
import { SolidAppProxy } from "../../models/solid-app";

export const PROXY = new SolidAppProxy({
  baseUrl: process.env.PROXY_BASE_URL || "http://localhost:4000",
  forwardingUrl: process.env.PROXY_FORWARDING_URL || "http://localhost:3000",
  tokenUrl: process.env.PROXY_TOKEN_URL || "http://localhost:4000/.oidc/token",
});
