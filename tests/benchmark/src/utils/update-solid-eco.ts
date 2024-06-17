import { AGENTS, getDataContainer } from "@seact/core";
import _ from "lodash";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import type { GetAccessTokenResponse } from "./get-access-token.ts";
import { createPseudoSession } from "./create-pseudo-session.ts";
import { createClientWithClaimContainer } from "./create-client-with-claim-container.ts";
import type { CreateClientsWithShapeTrees } from "./create-clients-with-shape-trees.ts";
import { createClientsWithShapeTrees } from "./create-clients-with-shape-trees.ts";
import { sleep } from "./sleep.ts";
import { createRegistries } from "./create-registries.ts";
import type { CreateClientsWithShapeTreesAndLogContainer } from "./create-clients-with-shape-trees-and-log-container.ts";
import { createClientsWithShapeTreesAndLogContainer } from "./create-clients-with-shape-trees-and-log-container.ts";
import { createDpcResource } from "./create-dpc-resource.ts";

interface UpdateSolidEcoOptions {
  storageNumbers: number[];
  shapeTreeNumbers: number[];
  clients: GetAccessTokenResponse[];
  dpc: GetAccessTokenResponse;
}

export async function updateSolidEco(
  options: UpdateSolidEcoOptions,
): Promise<void> {
  const dpcSession = createPseudoSession(options.dpc);
  const dataContainer = await getDataContainer(AGENTS.DPC, dpcSession);

  const p = _.max(options.storageNumbers) || 1;
  const q = _.max(options.shapeTreeNumbers) || 1;

  const clientsWithClaimContainer = await Promise.all(
    options.clients
      .filter((client, index) => index < p)
      .map((client) =>
        createClientWithClaimContainer(client, dataContainer, dpcSession),
      ),
  );

  let clientsWithShapeTrees: CreateClientsWithShapeTrees[] = [];
  for (const client of clientsWithClaimContainer) {
    await sleep();

    const created = await createClientsWithShapeTrees(client, q, dpcSession);
    clientsWithShapeTrees = clientsWithShapeTrees.concat(created);
  }

  let clientsWithShapeTreesAndLogContainer: CreateClientsWithShapeTreesAndLogContainer[] =
    [];
  for (const client of clientsWithShapeTrees) {
    await sleep();

    const created = await createClientsWithShapeTreesAndLogContainer(
      client,
      dpcSession,
    );
    clientsWithShapeTreesAndLogContainer =
      clientsWithShapeTreesAndLogContainer.concat(created);
  }

  for (const client of clientsWithShapeTreesAndLogContainer) {
    await sleep();

    await createDpcResource({ client });
  }

  let registries: WithResourceInfo[] = [];
  for (const storageNumber of options.storageNumbers) {
    for (const shapeTreeNumber of options.shapeTreeNumbers) {
      await sleep();

      const created = await createRegistries({
        storageNumber,
        shapeTreeNumber,
        dpcSession,
        clientsWithShapeTreesAndLogContainer,
      });
      registries = registries.concat(created);
    }
  }
}
