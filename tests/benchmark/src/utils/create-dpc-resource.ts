import {
  AGENTS,
  createUrl,
  createVerification,
  createVerificationAcl,
  toUrlString,
} from "@seact/core";
import type { CreateClientsWithShapeTreesAndLogContainer } from "./create-clients-with-shape-trees-and-log-container.ts";

interface CreateDpcResourceOptions {
  client: CreateClientsWithShapeTreesAndLogContainer;
}

export async function createDpcResource(
  options: CreateDpcResourceOptions,
): Promise<void> {
  const session = options.client.session;
  const token = options.client.token;
  const storage = createUrl(
    `http://proxy.localhost:4000/${options.client.name}/`,
  );

  const verification = await createVerification(session, token, storage);
  await createVerificationAcl(
    verification.internal_resourceInfo.sourceIri,
    toUrlString(AGENTS.DPC.webId),
    session,
  );
}
