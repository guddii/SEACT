import type { SolidDataset, Thing } from "@inrupt/solid-client";
import {
  saveSolidDatasetAt,
  createSolidDataset,
  getUrlAll,
  getThingAll,
  getSolidDataset,
} from "@inrupt/solid-client";
import type {
  WithChangeLog,
  WithServerResourceInfo,
} from "@inrupt/solid-client/dist/interfaces";
import type { Agent } from "../models/agent.ts";
import { VOCAB } from "../vocab";
import { toUrlString } from "./url-helper.ts";
import { getRegistrySet } from "./social-agent.ts";

export const getRegistries = async (
  agent: Agent,
  options: { fetch: typeof fetch },
): Promise<SolidDataset> => {
  const registriesUrl = await getRegistrySet(agent, options);
  let dataset: SolidDataset;
  try {
    dataset = await getSolidDataset(toUrlString(registriesUrl), options);
  } catch (e) {
    dataset = createSolidDataset();
  }
  return dataset;
};

export const setRegistries = async (
  agent: Agent,
  dataset: SolidDataset,
  options: {
    fetch: typeof fetch;
  },
): Promise<SolidDataset & WithServerResourceInfo & WithChangeLog> => {
  const registriesUrl = await getRegistrySet(agent, options);
  const prefixes = {
    ...VOCAB.INTEROP.PREFIX_AND_NAMESPACE,
    ...VOCAB.CLAIM.PREFIX_AND_NAMESPACE,
  };
  return saveSolidDatasetAt(toUrlString(registriesUrl), dataset, {
    fetch: options.fetch,
    prefixes,
  });
};

export const findRegistryByMonitoredStorage = (
  resource: URL,
  dataset: SolidDataset,
): Thing | undefined => {
  const registriesThings = getThingAll(dataset);

  return registriesThings.find((registry) => {
    return getUrlAll(registry, VOCAB.CLAIM.monitoredStorage).find((storage) => {
      return storage === toUrlString(resource);
    });
  });
};

export const findRegistryByTrustee = (
  resource: URL | string,
  dataset: SolidDataset,
): Thing | undefined => {
  const registriesThings = getThingAll(dataset);

  return registriesThings.find((registry) => {
    return getUrlAll(registry, VOCAB.CLAIM.trustee).find((item) => {
      return item === toUrlString(resource);
    });
  });
};
