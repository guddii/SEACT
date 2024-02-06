import type { IncomingMessage } from "node:http";
import {
  AGENTS,
  updateUrl,
  APPS,
  getContainerResources,
  findStorage,
} from "@seact/core";
import type { ProxySession } from "../services/proxy-session.ts";

export const findDpcContainer = async (
  req: IncomingMessage,
  session: ProxySession,
): Promise<URL | null> => {
  if (!req.url) {
    return null;
  }

  const resource = updateUrl(req.url, APPS.PROXY.baseUrl);
  const containerResources = getContainerResources(resource);

  const storage = await findStorage(containerResources, {
    fetch: session.fetch,
  });

  if (storage) {
    return updateUrl(`/logs${storage.pathname}`, AGENTS.DPC.storage);
  }

  return null;
};
