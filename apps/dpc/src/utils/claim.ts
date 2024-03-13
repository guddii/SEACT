import type { Thing } from "@inrupt/solid-client";
import {
  buildThing,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import {
  AGENTS,
  VOCAB,
  createOrUpdateResource,
  createUrl,
  toUrlString,
  updateUrl,
  APPS,
  isSuccessfulResponse,
} from "@seact/core";
import type { Session } from "@inrupt/solid-client-authn-node";
import { getAgentUserSession } from "./session.ts";
import { NetworkError } from "./error.ts";

export async function createVerification(
  session: Session,
  token: string,
  storage: URL,
): Promise<Response> {
  const resource = updateUrl("/dpc", storage);

  const body = `<#verification> a <${VOCAB.CLAIM.Verification}>;
    <${VOCAB.CLAIM.token}> "${token}".`;

  const response = await session.fetch(toUrlString(resource), {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
    },
    body,
  });

  if (!isSuccessfulResponse(response)) {
    throw new NetworkError(response);
  }

  return response;
}

export async function createVerificationAcl(
  webId: string,
  session: Session,
  storage: URL,
): Promise<Response> {
  const resource = updateUrl("/dpc.acl", storage);

  const body = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#owner>
    a acl:Authorization;
    acl:agent <${webId}>;
    acl:accessTo <./dpc>;
    acl:default <./dpc>;
    acl:mode
        acl:Read, acl:Write, acl:Control.
        
<#${crypto.randomUUID()}>
    a acl:Authorization;
    acl:agent <${toUrlString(AGENTS.DPC.webId)}>;
    acl:accessTo <./dpc>;
    acl:mode
        acl:Read.`;

  const response = await session.fetch(toUrlString(resource), {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
    },
    body,
  });

  if (!isSuccessfulResponse(response)) {
    throw new NetworkError(response);
  }

  return response;
}

export async function initClaim(
  token: string,
  storage: URL,
): Promise<Thing | null> {
  const session = await getAgentUserSession(AGENTS.DPC);

  return createOrUpdateResource({
    resource: updateUrl(
      `/logs/claims#${encodeURIComponent(toUrlString(storage))}`,
      AGENTS.DPC.storage,
    ),
    session,
    callback: (thing) => {
      return buildThing(thing)
        .addUrl(RDF.type, VOCAB.CLAIM.Claim)
        .addStringNoLocale(VOCAB.CLAIM.token, token)
        .addUrl(VOCAB.CLAIM.storage, toUrlString(storage))
        .build();
    },
    updateThing: false,
  });
}

export async function updateRegistry(
  webid: string,
  claim: Thing | null,
): Promise<Thing | null> {
  if (!claim) {
    throw new Error("No claim created");
  }
  const session = await getAgentUserSession(AGENTS.DPC);

  return createOrUpdateResource({
    resource: updateUrl(
      `/logs/registry#${encodeURIComponent(webid)}`,
      AGENTS.DPC.storage,
    ),
    session,
    callback: (thing) => {
      return buildThing(thing)
        .addUrl(RDF.type, VOCAB.CLAIM.RegisterEntry)
        .addUrl(VOCAB.CLAIM.webid, webid)
        .addUrl(VOCAB.CLAIM.claims, claim)
        .build();
    },
  });
}

export async function getRegistryEntry(
  webid: string,
  session: Session,
): Promise<string> {
  const resource = toUrlString(
    updateUrl(
      `/logs/registry#${encodeURIComponent(webid)}`,
      AGENTS.DPC.storage,
    ),
  );

  const dataset = await getSolidDataset(resource, {
    fetch: session.fetch,
  });

  const thing = getThing(dataset, resource);
  if (!thing) {
    return "";
  }

  return getUrl(thing, VOCAB.CLAIM.claims) || "";
}

export async function getToken(
  storage: string,
  session: Session,
): Promise<string> {
  const resource = toUrlString(
    updateUrl("/dpc#verification", createUrl(storage)),
  );
  const dataset = await getSolidDataset(resource, {
    fetch: session.fetch,
  });
  const thing = getThing(dataset, resource);
  if (!thing) {
    return "";
  }
  return getStringNoLocale(thing, VOCAB.CLAIM.token) || "";
}

const equalToken = (a: string | null, b: string | null): boolean => {
  if (!a) {
    return false;
  }
  if (!b) {
    return false;
  }
  return a.localeCompare(b) === 0;
};

export async function getLogBaseUrl(
  resource: URL,
  session: Session,
): Promise<URL> {
  const dataset = await getSolidDataset(toUrlString(resource), {
    fetch: session.fetch,
  });

  const thing = getThing(dataset, toUrlString(resource));
  if (!thing) {
    throw new Error("No thing");
  }

  const token = getStringNoLocale(thing, VOCAB.CLAIM.token);

  const storage = getUrl(thing, VOCAB.CLAIM.storage);
  if (!storage) {
    throw new Error("No storage");
  }

  const clientToken = await getToken(storage, session);

  if (!equalToken(token, clientToken)) {
    throw new Error("Invalid verification token");
  }
  const pathname = createUrl(storage).pathname;
  return createUrl(`/dpc/logs${pathname}`, APPS.PROXY.baseUrl);
}

export async function getClaimedResource(
  webId: string,
  pathname: string,
): Promise<Response> {
  const session = await getAgentUserSession(AGENTS.DPC);
  if (!session.info.isLoggedIn) {
    throw new Error("Session is not logged in");
  }

  const url = await getRegistryEntry(webId, session);
  const resource = createUrl(url);
  const logBaseUrl = await getLogBaseUrl(resource, session);
  return session.fetch(toUrlString(updateUrl(pathname, logBaseUrl)));
}
