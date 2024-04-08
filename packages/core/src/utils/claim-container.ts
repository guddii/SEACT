import type { IncomingMessage } from "node:http";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import type { SolidDataset } from "@inrupt/solid-client";
import { getUrlAll, createContainerInContainer } from "@inrupt/solid-client";
import { APPS } from "../config/apps";
import { AGENTS } from "../config/agents";
import { VOCAB } from "../vocab";
import { createUrl, updateUrl } from "./url-helper.ts";
import { findStorage, getContainerResources } from "./find-storage.ts";
import { findRegistryByMonitoredStorage, getRegistries } from "./registries.ts";

export const createClaimContainer = async (
  dataContainer: WithResourceInfo,
  options: {
    fetch: typeof fetch;
  },
): Promise<SolidDataset & WithResourceInfo> => {
  return createContainerInContainer(
    dataContainer.internal_resourceInfo.sourceIri,
    options,
  );
};

export const findDataRegistrationsInClaimContainer = async (
  req: IncomingMessage,
  options: { fetch: typeof fetch },
): Promise<URL[]> => {
  if (!req.url) {
    return [];
  }

  const resource = updateUrl(req.url, APPS.PROXY.baseUrl);
  const containerResources = getContainerResources(resource);
  const storage = await findStorage(containerResources, options);

  if (storage) {
    const registries = await getRegistries(AGENTS.DPC, options);
    const claim = findRegistryByMonitoredStorage(storage, registries);
    if (claim) {
      const hasDataRegistration = getUrlAll(
        claim,
        VOCAB.INTEROP.hasDataRegistration,
      );
      if (hasDataRegistration.length) {
        return hasDataRegistration.map((url) => createUrl(url));
      }
    }
  }

  return [];
};
