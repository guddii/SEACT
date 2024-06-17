import type { Session } from "@inrupt/solid-client-authn-node";
import { buildThing, universalAccess } from "@inrupt/solid-client";
import type {
  SolidDataset,
  WithChangeLog,
  WithServerResourceInfo,
  AccessModes,
} from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import { VOCAB } from "../vocab";
import { createOrUpdateResource } from "../solid/create-or-update-resource.ts";
import { updateUrl } from "./url-helper.ts";

export function createResourceUrl(storage: URL): URL {
  return updateUrl("/dpc#verification", storage);
}

export async function createVerification(
  session: { fetch: typeof fetch },
  token: string,
  storage: URL,
): Promise<SolidDataset & WithServerResourceInfo & WithChangeLog> {
  const resource = createResourceUrl(storage);
  return createOrUpdateResource({
    resource,
    session,
    callback: (thing) => {
      return buildThing(thing)
        .addUrl(RDF.type, VOCAB.CLAIM.Verification)
        .addStringNoLocale(VOCAB.CLAIM.verificationCode, token)
        .build();
    },
    updateThing: false,
  });
}

export async function createVerificationAcl(
  resourceUrl: string | null,
  webId: string,
  session: { fetch: typeof fetch },
): Promise<AccessModes | null> {
  const access: Partial<AccessModes> = { read: true };

  if (resourceUrl) {
    return universalAccess.setAgentAccess(resourceUrl, webId, access, session);
  }
  throw new Error("No resource url");
}
