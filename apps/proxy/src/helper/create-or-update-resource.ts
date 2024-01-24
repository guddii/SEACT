import type { SolidDataset, Thing } from "@inrupt/solid-client";
import {
  createSolidDataset,
  createThing,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { HTTP } from "@inrupt/vocab-common-rdf";
import { toUrlString } from "@seact/core";
import type { ProxySession } from "../services/proxy-session";

export interface CreateOrUpdateRessourceOptions {
  resource: URL;
  session: ProxySession;
  callback: (thing: Thing) => Thing;
}
export const createOrUpdateResource = async ({
  resource,
  session,
  callback,
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

  let thing = getThing(dataset, toUrlString(resource));

  if (!thing) {
    thing = createThing({ url: toUrlString(resource) });
  }

  const response = callback(thing);

  dataset = setThing(dataset, response);

  await saveSolidDatasetAt(toUrlString(resource), dataset, {
    fetch: session.fetch,
    prefixes: {
      ...HTTP.PREFIX_AND_NAMESPACE,
      ...{ httpm: "http://www.w3.org/2011/http-methods#" },
    },
  });

  return response;
};
