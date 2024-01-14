import type { IncomingMessage } from "node:http";
import type { IriString } from "@inrupt/solid-client";

export const findDpcContainer = (req: IncomingMessage): IriString | null => {
  if (!req.url) {
    return null;
  }

  // TODO: This should be a dynamic variable
  return req.url.startsWith("/client")
    ? `${process.env.DPC_STORAGE}/requests/client`
    : null;
};
