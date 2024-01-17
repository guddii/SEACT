import type { AccessModes } from "@inrupt/solid-client";
import { universalAccess } from "@inrupt/solid-client";
import { CLIENT, toUrlString } from "core";
import type { ProxySession } from "../services/proxy-session";

export const createAccess = async (
  resource: URL,
  session: ProxySession | null,
): Promise<AccessModes | null> => {
  if (!session) {
    return null;
  }
  const webId = toUrlString(CLIENT.webId);
  return universalAccess.setAgentAccess(
    toUrlString(resource),
    webId,
    { read: true },
    { fetch: session.fetch },
  );
};
