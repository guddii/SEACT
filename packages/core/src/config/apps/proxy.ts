import process from "node:process";
import crypto from "node:crypto";
import { SolidAppProxy } from "../../models/solid-app";

export const PROXY = new SolidAppProxy({
  baseUrl: process.env.PROXY_BASE_URL || "http://proxy.localhost:4000",
  forwardingUrl:
    process.env.PROXY_FORWARDING_URL || "http://server.localhost:3000",
  openidConfigurationUrl:
    process.env.PROXY_OPENID_CONFIGURATION_URL ||
    "http://proxy.localhost:4000/.well-known/openid-configuration",
  featureLogging: Boolean(process.env.FEATURE_FLAG_LOGGING),
  bypassToken:
    process.env.PROXY_BYPASS_TOKEN || crypto.randomBytes(20).toString("hex"),
});
