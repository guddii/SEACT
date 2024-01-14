import type { SolidDataset, Thing, UrlString } from "@inrupt/solid-client";
import {
  createSolidDataset,
  createThing,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { HTTP } from "@inrupt/vocab-common-rdf";
import { getAgentUserSession } from "../services/proxy-session";
import { createAccess } from "./create-access";

export interface CreateOrUpdateRessourceOptions {
  ressource: UrlString;
  callback: (thing: Thing) => Thing;
}
export const createOrUpdateRessource = async ({
  ressource,
  callback,
}: CreateOrUpdateRessourceOptions): Promise<Thing> => {
  const ressourceUrl = new URL(ressource);
  if (!ressourceUrl.hash) {
    ressourceUrl.hash = Date.now().toString();
  }

  const session = await getAgentUserSession();

  let dataset: SolidDataset;

  try {
    dataset = await getSolidDataset(ressourceUrl.toString(), {
      fetch: session.fetch,
    });
  } catch (error) {
    dataset = createSolidDataset();
  }

  let thing = getThing(dataset, ressourceUrl.toString());

  if (!thing) {
    thing = createThing({ url: ressourceUrl.toString() });
  }

  const response = callback(thing);

  dataset = setThing(dataset, response);

  await saveSolidDatasetAt(ressourceUrl.toString(), dataset, {
    fetch: session.fetch,
    prefixes: {
      ...HTTP.PREFIX_AND_NAMESPACE,
      ...{ httpm: "http://www.w3.org/2011/http-methods#" },
    },
  });

  await createAccess(ressourceUrl.toString());

  return response;
};
