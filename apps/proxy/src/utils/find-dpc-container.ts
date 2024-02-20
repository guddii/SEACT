import type { IncomingMessage } from "node:http";
import {
  AGENTS,
  updateUrl,
  APPS,
  getContainerResources,
  findStorage,
} from "@seact/core";

export const findDpcContainer = async (
  req: IncomingMessage,
  session: { fetch: typeof fetch },
): Promise<URL | null> => {
  if (!req.url) {
    return null;
  }

  const resource = updateUrl(req.url, APPS.PROXY.baseUrl);
  const containerResources = getContainerResources(resource);

  const storage = await findStorage(containerResources, session);

  if (storage) {
    return updateUrl(`/logs${storage.pathname}`, AGENTS.DPC.storage);
  }

  return null;
};
