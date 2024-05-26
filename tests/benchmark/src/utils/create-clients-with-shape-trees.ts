import { randomBytes } from "node:crypto";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import { createContainerInContainer } from "@inrupt/solid-client";
import {
  createContainerMeta,
  VOCAB,
  toUrlString,
  updateUrl,
  AGENTS,
} from "@seact/core";
import { XSD } from "@inrupt/vocab-common-rdf";
import type { PseudoSession } from "./create-pseudo-session.ts";
import type { ClientWithClaimContainer } from "./create-client-with-claim-container.ts";
import { sleep } from "./sleep.ts";

export interface CreateClientsWithShapeTrees extends ClientWithClaimContainer {
  shapeTrees: WithResourceInfo[];
}

export async function createClientsWithShapeTrees(
  client: ClientWithClaimContainer,
  q: number,
  dpcSession: PseudoSession,
): Promise<CreateClientsWithShapeTrees> {
  const shapeTrees: WithResourceInfo[] = [];
  for (let i = 0; i < q; i++) {
    await sleep();

    const shapeTree = await createShapeTree(client.claimContainer, dpcSession);
    shapeTrees.push(shapeTree);
  }

  return {
    ...client,
    shapeTrees,
  };
}

async function createShapeTree(
  claimContainer: WithResourceInfo,
  dpcSession: PseudoSession,
): Promise<WithResourceInfo> {
  const resourceInfo = await createContainerInContainer(
    claimContainer.internal_resourceInfo.sourceIri,
    dpcSession,
  );

  const sourceIri = resourceInfo.internal_resourceInfo.sourceIri;
  const socialAgent = toUrlString(updateUrl("#id", AGENTS.DPC.webId));
  const date = new Date().toISOString();
  const file = randomBytes(8).toString("hex");
  const hash = randomBytes(8).toString("hex");
  const tree = toUrlString(
    updateUrl(`/ns/${file}.tree#${hash}`, AGENTS.DPC.storage),
  );

  const body = [
    `INSERT DATA { <${sourceIri}> a <${VOCAB.INTEROP.DataRegistration}> }`,
    `INSERT DATA { <${sourceIri}> <${VOCAB.INTEROP.registeredBy}> <${socialAgent}> }`,
    `INSERT DATA { <${sourceIri}> <${VOCAB.INTEROP.registeredAt}> "${date}"^^<${XSD.dateTime}> }`,
    // `INSERT DATA { <${sourceIri}> <${INTEROP.updatedAt}> "${date}"^^<${XSD.dateTime}> }`,
    `INSERT DATA { <${sourceIri}> <${VOCAB.INTEROP.registeredShapeTree}> <${tree}> }`,
  ];

  await createContainerMeta(sourceIri, body, dpcSession);

  return resourceInfo;
}
