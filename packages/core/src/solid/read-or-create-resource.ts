import type {
  SolidDataset,
  Thing,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import {
  buildThing,
  createSolidDataset,
  createThing,
  getSolidDataset,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { DCTERMS, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import { toUrlString } from "../utils/url-helper.ts";

export interface ThingCallbackPair {
  name: string;
  callback: (thing: Thing) => Thing;
}

export interface ReadOrCreateRessourceOptions {
  resource: URL;
  session: { fetch: typeof fetch };
  thingCallbackPairs: ThingCallbackPair[];
  prefixes?: Record<string, string>;
  createHeader?: boolean;
}

export const readOrCreateResource = async ({
  resource,
  session,
  thingCallbackPairs,
  prefixes = {},
  createHeader = false,
}: ReadOrCreateRessourceOptions): Promise<
  SolidDataset & WithServerResourceInfo
> => {
  try {
    return await getSolidDataset(toUrlString(resource), {
      fetch: session.fetch,
    });
  } catch (error) {
    let dataset = createSolidDataset();

    if (createHeader) {
      const header = buildThing(createThing({ url: toUrlString(resource) }))
        .addDate(DCTERMS.issued, new Date())
        .addDate(DCTERMS.modified, new Date())
        .addStringEnglish(RDFS.label, "Access log vocabulary")
        .build();
      dataset = setThing(dataset, header);
    }

    const newPrefixes = {
      ...prefixes,
      ...RDFS.PREFIX_AND_NAMESPACE,
      ...DCTERMS.PREFIX_AND_NAMESPACE,
      ...XSD.PREFIX_AND_NAMESPACE,
    };

    for (const thingCallbackPair of thingCallbackPairs) {
      const thing = createThing({ name: thingCallbackPair.name });
      dataset = setThing(dataset, thingCallbackPair.callback(thing));
    }

    return saveSolidDatasetAt(toUrlString(resource), dataset, {
      fetch: session.fetch,
      prefixes: newPrefixes,
    });
  }
};
