import type { Thing } from "@inrupt/solid-client";
import {
  getPropertyAll,
  getTermAll,
  getSolidDataset,
  getThingAll,
} from "@inrupt/solid-client";
import { toUrlString } from "@seact/core";
import type { UseServerSession } from "../hooks/useServerSession.ts";

type GetDatasetAsMatrixOptions = Pick<UseServerSession, "session">;

const getAsMatrix = (thingAll: Thing[]): Record<string, string>[] => {
  return thingAll.flatMap((thing, index) => {
    const matrix = { key: String(index), thing: thing.url };
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
  resource: string | URL,
  session: { fetch: typeof fetch },
): Promise<Record<string, string>[]> => {
  try {
    const dataset = await getSolidDataset(toUrlString(resource), {
      fetch: session.fetch,
    });

    const thingAll = getThingAll(dataset).reverse();
    return getAsMatrix(thingAll);
  } catch (e) {
    return [];
  }
};
