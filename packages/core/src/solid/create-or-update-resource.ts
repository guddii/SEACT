import type { SolidDataset, Thing } from "@inrupt/solid-client";
import {
  createSolidDataset,
  createThing,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { toUrlString } from "../utils/url-helper";

export interface CreateOrUpdateRessourceOptions {
  resource: URL;
  session: { fetch: typeof fetch };
  callback: (thing: Thing) => Thing;
  prefixes?: Record<string, string>;
  updateThing?: boolean;
}
export const createOrUpdateResource = async ({
  resource,
  session,
  callback,
  prefixes = {},
  updateThing = true,
}: CreateOrUpdateRessourceOptions): Promise<Thing> => {
  if (!resource.hash) {
    resource.hash = Date.now().toString();
  }

  let dataset: SolidDataset;

  try {
    dataset = await getSolidDataset(toUrlString(resource), {
      fetch: session.fetch,
    });
  } catch (error) {
    dataset = createSolidDataset();
  }

  let thing;
  if (updateThing) {
    thing = getThing(dataset, toUrlString(resource));
  }
  if (!thing) {
    thing = createThing({ url: toUrlString(resource) });
  }

  const response = callback(thing);

  dataset = setThing(dataset, response);

  await saveSolidDatasetAt(toUrlString(resource), dataset, {
    fetch: session.fetch,
    prefixes,
  });

  return response;
};
