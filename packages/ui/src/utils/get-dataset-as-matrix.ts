import type { Thing } from "@inrupt/solid-client";
import {
  getPropertyAll,
  getTermAll,
  getSolidDataset,
  getThingAll,
} from "@inrupt/solid-client";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { toUrlString } from "core";

interface GetDatasetAsMatrixOptions {
  session: Session;
}

const getAsMatrix = (thingAll: Thing[]): Record<string, string>[] => {
  return thingAll.flatMap((thing) => {
    const matrix = { thing: thing.url };
    getPropertyAll(thing).forEach((property) => {
      const termAll = getTermAll(thing, property);
      Object.assign(matrix, {
        [property]: termAll.map((term) => term.value).join(", "),
      });
    });

    return matrix;
  });
};

export const getDatasetAsMatrix = async (
  ressource: string | URL,
  options: GetDatasetAsMatrixOptions,
): Promise<Record<string, string>[]> => {
  const { session } = options;

  if (!session.info.isLoggedIn) {
    return [];
  }

  const dataset = await getSolidDataset(toUrlString(ressource), {
    fetch: session.fetch,
  });

  const thingAll = getThingAll(dataset);
  return getAsMatrix(thingAll);
};
