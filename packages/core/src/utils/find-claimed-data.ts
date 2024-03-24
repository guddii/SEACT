import type { IncomingMessage } from "node:http";
import { getUrl } from "@inrupt/solid-client";
import { APPS } from "../config/apps";
import { VOCAB } from "../vocab";
import { AGENTS } from "../config/agents";
import { createUrl, updateUrl } from "./url-helper";
import { findStorage, getContainerResources } from "./find-storage";
import { findRegistryByMonitoredStorage, getRegistries } from "./registries";

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
    const registries = await getRegistries(AGENTS.DPC, options);
    const claim = findRegistryByMonitoredStorage(storage, registries);
    if (claim) {
      const claimStorage = getUrl(claim, VOCAB.CLAIM.claimedData);
      if (claimStorage) {
        return createUrl(claimStorage);
      }
    }
  }

  return null;
};
