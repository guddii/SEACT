import type { SolidDataset, Thing } from "@inrupt/solid-client";
import {
  setThing,
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
  createUrl,
  toUrlString,
  updateUrl,
  getDataContainer,
  getRegistries,
  setRegistries,
  findRegistryByTrustee,
  createAccessLogNamespace,
  createClaimContainer,
  createAccessLogContainer,
} from "@seact/core";
import type { Session } from "@inrupt/solid-client-authn-node";
import type {
  WithChangeLog,
  WithServerResourceInfo,
} from "@inrupt/solid-client/dist/interfaces";
import { getAgentUserSession } from "./session.ts";
import { createShake256Hash } from "./shake256.ts";

export async function updateRegistry(
  verificationResource: string,
  trustee: string,
  token: string,
  storage: URL,
): Promise<SolidDataset & WithServerResourceInfo & WithChangeLog> {
  const session = await getAgentUserSession(AGENTS.DPC);
  const accessLogNamespace = await createAccessLogNamespace(
    AGENTS.DPC,
    session,
  );

  let registries: SolidDataset = await getRegistries(AGENTS.DPC, session);

  const dataContainer = await getDataContainer(AGENTS.DPC, session);
  const claimContainer = await createClaimContainer(dataContainer, session);
  const accessLogContainer = await createAccessLogContainer(
    claimContainer,
    accessLogNamespace,
    session,
  );

  const claimThing: Thing = buildThing({
    name: createShake256Hash(toUrlString(storage)),
  })
    .addUrl(RDF.type, VOCAB.CLAIM.Registry)
    .addUrl(VOCAB.CLAIM.trustee, trustee)
    .addUrl(VOCAB.CLAIM.monitoredStorage, toUrlString(storage))
    .addUrl(
      VOCAB.CLAIM.verificationResource,
      `${verificationResource}#verification`,
    )
    .addStringNoLocale(VOCAB.CLAIM.verificationCode, token)
    .addUrl(
      VOCAB.CLAIM.claimedData,
      claimContainer.internal_resourceInfo.sourceIri,
    )
    .build();

  const claimAndInteropThing = buildThing(claimThing)
    .addUrl(RDF.type, VOCAB.INTEROP.DataRegistry)
    .addUrl(
      VOCAB.INTEROP.hasDataRegistration,
      accessLogContainer.internal_resourceInfo.sourceIri,
    )
    .addUrl(VOCAB.CLAIM.monitoredStorage, toUrlString(storage))
    .build();

  registries = setThing(registries, claimAndInteropThing);

  return setRegistries(AGENTS.DPC, registries, session);
}

export function getTokenFromRegistry(registry: Thing): string | null {
  return getStringNoLocale(registry, VOCAB.CLAIM.verificationCode);
}

export async function getTokenFromClient(
  registry: Thing,
  session: Session,
): Promise<string> {
  const verificationResource = getUrl(
    registry,
    VOCAB.CLAIM.verificationResource,
  );

  if (!verificationResource) {
    throw new Error("No verification resource in registry");
  }

  const verificationResourceUrl = createUrl(verificationResource);
  const dataset = await getSolidDataset(toUrlString(verificationResourceUrl), {
    fetch: session.fetch,
  });

  const thing = getThing(dataset, toUrlString(verificationResourceUrl));
  if (!thing) {
    return "";
  }
  return getStringNoLocale(thing, VOCAB.CLAIM.verificationCode) || "";
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

export async function getClaimedResource(
  webId: string,
  pathname: string,
): Promise<Response> {
  const session = await getAgentUserSession(AGENTS.DPC);
  if (!session.info.isLoggedIn) {
    throw new Error("Session is not logged in");
  }

  const registries: SolidDataset = await getRegistries(AGENTS.DPC, session);
  const registry = findRegistryByTrustee(webId, registries);
  if (!registry) {
    throw new Error("No registry entry found");
  }

  const tokenFromRegistry = getTokenFromRegistry(registry);
  const tokenFromClient = await getTokenFromClient(registry, session);

  if (!equalToken(tokenFromRegistry, tokenFromClient)) {
    throw new Error("Invalid token");
  }

  const claimedData = getUrl(registry, VOCAB.CLAIM.claimedData);
  if (!claimedData) {
    throw new Error("No claimed data");
  }

  const claimedDataUrl = createUrl(claimedData);
  const url = updateUrl(pathname, claimedDataUrl);

  return session.fetch(url);
}
