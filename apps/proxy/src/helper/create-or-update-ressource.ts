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
  ressource: URL;
  session: ProxySession;
  callback: (thing: Thing) => Thing;
}
export const createOrUpdateRessource = async ({
  ressource,
  session,
  callback,
}: CreateOrUpdateRessourceOptions): Promise<Thing> => {
  if (!ressource.hash) {
    ressource.hash = Date.now().toString();
  }

  let dataset: SolidDataset;

  try {
    dataset = await getSolidDataset(toUrlString(ressource), {
      fetch: session.fetch,
    });
  } catch (error) {
    dataset = createSolidDataset();
  }

  let thing = getThing(dataset, toUrlString(ressource));

  if (!thing) {
    thing = createThing({ url: toUrlString(ressource) });
  }

  const response = callback(thing);

  dataset = setThing(dataset, response);

  await saveSolidDatasetAt(toUrlString(ressource), dataset, {
    fetch: session.fetch,
    prefixes: {
      ...HTTP.PREFIX_AND_NAMESPACE,
      ...{ httpm: "http://www.w3.org/2011/http-methods#" },
    },
  });

  return response;
};
