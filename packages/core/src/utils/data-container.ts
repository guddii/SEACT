import type {
  SolidDataset,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import { createContainerAt, getSolidDataset } from "@inrupt/solid-client";
import type { Agent } from "../models/agent.ts";
import { toUrlString, updateUrl } from "./url-helper.ts";

export const getDataContainer = async (
  agent: Agent,
  options: {
    fetch: typeof fetch;
  },
): Promise<SolidDataset & WithServerResourceInfo> => {
  const dataContainer = updateUrl("/data/", agent.storage);

  try {
    return await getSolidDataset(toUrlString(dataContainer), options);
  } catch (e) {
    return createContainerAt(toUrlString(dataContainer), options);
  }
};
