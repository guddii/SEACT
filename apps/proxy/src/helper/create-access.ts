import type { AccessModes, UrlString } from "@inrupt/solid-client";
import { universalAccess } from "@inrupt/solid-client";
import { getAgentUserSession } from "../services/proxy-session";

export const createAccess = async (
  resourceUrl: UrlString,
): Promise<AccessModes | null> => {
  const session = await getAgentUserSession();
  return universalAccess.setAgentAccess(
    resourceUrl,
    process.env.CLIENT_WEB_ID || "",
    { read: true },
    { fetch: session.fetch },
  );
};
