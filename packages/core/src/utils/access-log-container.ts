import type { SolidDataset } from "@inrupt/solid-client";
import {
  getSolidDataset,
  getThing,
  getUrl,
  createContainerInContainer,
} from "@inrupt/solid-client";
import type { WithResourceInfo } from "@inrupt/solid-client/src/interfaces.ts";
import { XSD } from "@inrupt/vocab-common-rdf";
import { AGENTS } from "../config/agents";
import type { AccessLogNamespace } from "../namepace/access-log.ts";
import { INTEROP } from "../vocab/interop.ts";
import { VOCAB } from "../vocab";
import { createUrl, toUrlString, updateUrl } from "./url-helper.ts";

export const generateRegisteredShapeTree = (
  accessLogNamespace: AccessLogNamespace,
): string => {
  return `${accessLogNamespace.tree.internal_resourceInfo.sourceIri}#AccessLogRegistrationTree`;
};

export const createAccessLogContainerMeta = async (
  accessLogContainer: WithResourceInfo,
  accessLogNamespace: AccessLogNamespace,
  options: {
    fetch: typeof fetch;
  },
): Promise<Response> => {
  const subject = accessLogContainer.internal_resourceInfo.sourceIri;
  const date = new Date().toISOString();
  const socialAgent = toUrlString(updateUrl("#id", AGENTS.DPC.webId));

  return options.fetch(`${subject}.meta`, {
    headers: {
      "Content-Type": "application/sparql-update",
    },
    method: "PATCH",
    body: [
      `INSERT DATA { <${subject}> a <${INTEROP.DataRegistration}> }`,
      `INSERT DATA { <${subject}> <${INTEROP.registeredBy}> <${socialAgent}> }`,
      `INSERT DATA { <${subject}> <${INTEROP.registeredAt}> "${date}"^^<${XSD.dateTime}> }`,
      // `INSERT DATA { <${subject}> <${INTEROP.updatedAt}> "${date}"^^<${XSD.dateTime}> }`,
      `INSERT DATA { <${subject}> <${INTEROP.registeredShapeTree}> <${generateRegisteredShapeTree(accessLogNamespace)}> }`,
    ].join(";"),
  });
};

export const createAccessLogContainer = async (
  claimContainer: WithResourceInfo,
  accessLogNamespace: AccessLogNamespace,
  options: {
    fetch: typeof fetch;
  },
): Promise<SolidDataset & WithResourceInfo> => {
  const accessLogContainer = await createContainerInContainer(
    claimContainer.internal_resourceInfo.sourceIri,
    {
      fetch: options.fetch,
      slugSuggestion: "AccessLog",
    },
  );

  await createAccessLogContainerMeta(
    accessLogContainer,
    accessLogNamespace,
    options,
  );

  return accessLogContainer;
};

export interface TestAccessLogContainer {
  isAccessLogContainer: boolean;
  container: URL;
}

export const testAccessLogContainer = async (
  dataRegistrationsInClaimContainer: URL,
  accessLogNamespace: AccessLogNamespace,
  options: {
    fetch: typeof fetch;
  },
): Promise<TestAccessLogContainer> => {
  const dataset = await getSolidDataset(
    toUrlString(dataRegistrationsInClaimContainer),
    options,
  );
  const thing = getThing(
    dataset,
    toUrlString(dataRegistrationsInClaimContainer),
  );
  if (!thing) {
    return {
      isAccessLogContainer: false,
      container: createUrl(dataRegistrationsInClaimContainer),
    };
  }
  const registeredShapeTree = {
    fromDataset: getUrl(thing, VOCAB.INTEROP.registeredShapeTree),
    fromNamespace: generateRegisteredShapeTree(accessLogNamespace),
  };

  const test =
    registeredShapeTree.fromDataset === registeredShapeTree.fromNamespace;

  return {
    isAccessLogContainer: test,
    container: createUrl(dataRegistrationsInClaimContainer),
  };
};

export const findAccessLogContainer = async (
  dataRegistrationsInClaimContainer: URL[],
  accessLogNamespace: AccessLogNamespace,
  options: {
    fetch: typeof fetch;
  },
): Promise<URL | null> => {
  const unresolvedTests = dataRegistrationsInClaimContainer.map((url) =>
    testAccessLogContainer(url, accessLogNamespace, options),
  );
  const testedAccessLogContainers = await Promise.all(unresolvedTests);
  const accessLogContainer = testedAccessLogContainers.find(
    (testedAccessLogContainer) => testedAccessLogContainer.isAccessLogContainer,
  );

  if (accessLogContainer) {
    return accessLogContainer.container;
  }
  return null;
};
