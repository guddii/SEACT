import type { IncomingMessage } from "node:http";
import { DPC, updateUrl } from "core";

export const findDpcContainer = (req: IncomingMessage): URL | null => {
  if (!req.url) {
    return null;
  }

  // TODO: This should be a dynamic variable
  return req.url.startsWith("/client")
    ? updateUrl(`/requests/client`, DPC.storage)
    : null;
};
