import type { BinaryLike } from "node:crypto";
import crypto from "node:crypto";
import type { Thing } from "@inrupt/solid-client";
import {
  buildThing,
  createSolidDataset,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import { AGENTS, toUrlString, updateUrl, VOCAB } from "@seact/core";
import { RDF } from "@inrupt/vocab-common-rdf";
import type { PseudoSession } from "./create-pseudo-session.ts";
import type { CreateClientsWithShapeTreesAndLogContainer } from "./create-clients-with-shape-trees-and-log-container.ts";

export interface CreateRegistriesOptions {
  storageNumber: number;
  shapeTreeNumber: number;
  dpcSession: PseudoSession;
  clientsWithShapeTreesAndLogContainer: CreateClientsWithShapeTreesAndLogContainer[];
}

export async function createRegistries(
  options: CreateRegistriesOptions,
): Promise<WithResourceInfo> {
  const registriesUrl = updateUrl(
    `registries-${options.storageNumber}-${options.shapeTreeNumber}`,
    AGENTS.DPC.storage,
  );

  // new Solid Dataset
  let registries = createSolidDataset();

  for (const client of options.clientsWithShapeTreesAndLogContainer.filter(
    (_, index) => index < options.storageNumber,
  )) {
    const monitoredStorage = `http://proxy.localhost:4000/${client.name}/`;
    const trustee = `http://proxy.localhost:4000/${client.name}/profile/card#me`;
    const verificationResource = `http://proxy.localhost:4000/${client.name}/dpc`;

    const claimThing: Thing = buildThing({
      name: createShake256Hash(toUrlString(monitoredStorage)),
    })
      .addUrl(RDF.type, VOCAB.CLAIM.Registry)
      .addUrl(VOCAB.CLAIM.trustee, trustee)
      .addUrl(VOCAB.CLAIM.monitoredStorage, toUrlString(monitoredStorage))
      .addUrl(
        VOCAB.CLAIM.verificationResource,
        `${verificationResource}#verification`,
      )
      .addStringNoLocale(VOCAB.CLAIM.verificationCode, client.token)
      .addUrl(
        VOCAB.CLAIM.claimedData,
        client.claimContainer.internal_resourceInfo.sourceIri,
      )
      .build();

    const claimAndInteropThing = buildThing(claimThing).addUrl(
      RDF.type,
      VOCAB.INTEROP.DataRegistry,
    );

    for (const shapeTree of client.shapeTrees.filter(
      (_, index) => index < options.shapeTreeNumber - 1,
    )) {
      claimAndInteropThing.addUrl(
        VOCAB.INTEROP.hasDataRegistration,
        shapeTree.internal_resourceInfo.sourceIri,
      );
    }

    claimAndInteropThing.addUrl(
      VOCAB.INTEROP.hasDataRegistration,
      client.accessLogContainer.internal_resourceInfo.sourceIri,
    );

    claimAndInteropThing.addUrl(
      VOCAB.CLAIM.monitoredStorage,
      toUrlString(monitoredStorage),
    );

    registries = setThing(registries, claimAndInteropThing.build());
  }

  const prefixes = {
    ...VOCAB.INTEROP.PREFIX_AND_NAMESPACE,
    ...VOCAB.CLAIM.PREFIX_AND_NAMESPACE,
  };

  return saveSolidDatasetAt(toUrlString(registriesUrl), registries, {
    fetch: options.dpcSession.fetch,
    prefixes,
  });
}

const createShake256Hash = (data: BinaryLike, outputLength = 4): string => {
  return crypto
    .createHash("shake256", { outputLength })
    .update(data)
    .digest("hex");
};
