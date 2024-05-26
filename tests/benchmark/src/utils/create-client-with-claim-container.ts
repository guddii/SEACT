import { randomBytes } from "node:crypto";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import { createClaimContainer } from "@seact/core";
import type { GetAccessTokenResponse } from "./get-access-token.ts";
import type { PseudoSession } from "./create-pseudo-session.ts";
import { createPseudoSession } from "./create-pseudo-session.ts";

const token = randomBytes(48).toString("hex");

export interface ClientWithClaimContainer extends GetAccessTokenResponse {
  claimContainer: WithResourceInfo;
  session: PseudoSession;
  token: string;
}

export async function createClientWithClaimContainer(
  client: GetAccessTokenResponse,
  dataContainer: WithResourceInfo,
  dpcSession: PseudoSession,
): Promise<ClientWithClaimContainer> {
  const claimContainer = await createClaimContainer(dataContainer, dpcSession);

  return {
    ...client,
    claimContainer,
    session: createPseudoSession(client),
    token,
  };
}
