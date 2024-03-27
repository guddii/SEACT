import { getSolidDataset, type SolidDataset } from "@inrupt/solid-client";
import { toUrlString } from "./url-helper.ts";

export const getWebID = (
  webIdUrl: URL | string,
  options: { fetch: typeof fetch },
): Promise<SolidDataset> => {
  return getSolidDataset(toUrlString(webIdUrl), options);
};
