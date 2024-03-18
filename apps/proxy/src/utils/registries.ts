import type { SolidDataset, Thing } from "@inrupt/solid-client";
import { getUrlAll, getThingAll, getSolidDataset } from "@inrupt/solid-client";
import type { Agent } from "@seact/core";
import { AGENTS, updateUrl, toUrlString, VOCAB } from "@seact/core";

export const getRegistries = async (
  agent: Agent,
  options: { fetch: typeof fetch },
): Promise<Thing[]> => {
  try {
    const registriesUrl = updateUrl("/registries", agent.storage);

    const dataset: SolidDataset = await getSolidDataset(
      toUrlString(registriesUrl),
      options,
    );

    return getThingAll(dataset);
  } catch (error) {
    return [];
  }
};

export const findRegistryByMonitoredStorage = async (
  resource: URL,
  options: { fetch: typeof fetch },
): Promise<Thing | undefined> => {
  const registries = await getRegistries(AGENTS.DPC, options);

  return registries.find((registry) => {
    return getUrlAll(registry, VOCAB.CLAIM.monitoredStorage).find((storage) => {
      return storage === toUrlString(resource);
    });
  });
};
