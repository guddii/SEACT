import type { Thing } from "@inrupt/solid-client";
import {
  buildThing,
  getThing,
  getUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import type { Agent } from "../models/agent.ts";
import { INTEROP } from "../vocab/interop.ts";
import { createUrl, toUrlString, updateUrl } from "./url-helper.ts";
import { getWebID } from "./web-id.ts";

const defaultRegistriesUrl = (agent: Agent): URL => {
  return updateUrl("/registries", agent.storage);
};

const socialAgentUrl = (agent: Agent): URL => {
  const webIdUrl = agent.webId;
  webIdUrl.hash = "#id";
  return webIdUrl;
};

export const getSocialAgent = async (
  agent: Agent,
  options: { fetch: typeof fetch },
): Promise<Thing> => {
  const webIdUrl = socialAgentUrl(agent);
  let webIdDataset = await getWebID(webIdUrl, options);

  let interopThing = getThing(webIdDataset, toUrlString(webIdUrl));
  if (!interopThing) {
    interopThing = buildThing({ name: "#id" })
      .addUrl(RDF.type, INTEROP.Agent)
      .addUrl(INTEROP.hasRegistrySet, toUrlString(defaultRegistriesUrl(agent)))
      .build();
    webIdDataset = setThing(webIdDataset, interopThing);
    await saveSolidDatasetAt(toUrlString(webIdUrl), webIdDataset, options);
  }

  return interopThing;
};

export const getRegistrySet = async (
  agent: Agent,
  options: { fetch: typeof fetch },
): Promise<URL> => {
  const webIdUrl = socialAgentUrl(agent);
  let webIdDataset = await getWebID(webIdUrl, options);
  let socialAgent = await getSocialAgent(agent, options);
  let hasRegistrySet = getUrl(socialAgent, INTEROP.hasRegistrySet);
  if (!hasRegistrySet) {
    socialAgent = buildThing(socialAgent)
      .addUrl(RDF.type, INTEROP.Agent)
      .addUrl(INTEROP.hasRegistrySet, toUrlString(defaultRegistriesUrl(agent)))
      .build();
    webIdDataset = setThing(webIdDataset, socialAgent);
    await saveSolidDatasetAt(toUrlString(webIdUrl), webIdDataset, options);

    hasRegistrySet = toUrlString(defaultRegistriesUrl(agent));
  }

  return createUrl(hasRegistrySet);
};
