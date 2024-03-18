import type { IncomingMessage } from "node:http";
import {
  APPS,
  VOCAB,
  createUrl,
  findStorage,
  getContainerResources,
  updateUrl,
} from "@seact/core";
import { getUrl } from "@inrupt/solid-client";
import { findRegistryByMonitoredStorage } from "./registries.ts";

export const findClaimedData = async (
  req: IncomingMessage,
  options: { fetch: typeof fetch },
): Promise<URL | null> => {
  if (!req.url) {
    return null;
  }

  const resource = updateUrl(req.url, APPS.PROXY.baseUrl);
  const containerResources = getContainerResources(resource);

  const storage = await findStorage(containerResources, options);

  if (storage) {
    const claim = await findRegistryByMonitoredStorage(storage, options);
    if (claim) {
      const claimStorage = getUrl(claim, VOCAB.CLAIM.claimedData);
      if (claimStorage) {
        return createUrl(claimStorage);
      }
    }
  }

  return null;
};
