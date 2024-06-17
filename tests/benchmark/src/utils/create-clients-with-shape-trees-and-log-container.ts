import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import {
  AGENTS,
  createAccessLogContainer,
  createAccessLogNamespace,
} from "@seact/core";
import type { PseudoSession } from "./create-pseudo-session.ts";
import type { CreateClientsWithShapeTrees } from "./create-clients-with-shape-trees.ts";

export interface CreateClientsWithShapeTreesAndLogContainer
  extends CreateClientsWithShapeTrees {
  accessLogContainer: WithResourceInfo;
}

export async function createClientsWithShapeTreesAndLogContainer(
  client: CreateClientsWithShapeTrees,
  dpcSession: PseudoSession,
): Promise<CreateClientsWithShapeTreesAndLogContainer> {
  const accessLogNamespace = await createAccessLogNamespace(
    AGENTS.DPC,
    dpcSession,
  );

  const accessLogContainer = await createAccessLogContainer(
    client.claimContainer,
    accessLogNamespace,
    dpcSession,
  );

  return {
    ...client,
    accessLogContainer,
  };
}
