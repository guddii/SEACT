import type { IncomingMessage } from "node:http";
import {
  DPC,
  updateUrl,
  createUrl,
  PROXY,
  appendTrailingSlash,
} from "@seact/core";
import { WS } from "@inrupt/vocab-solid";
import LinkHeader from "http-link-header";
import type { ProxySession } from "../services/proxy-session.ts";

const isStorage = (link: string | null): boolean => {
  if (!link) {
    return false;
  }

  const linkHeader = LinkHeader.parse(link);

  return linkHeader
    .rel("type")
    .map((ref) => ref.uri)
    .includes(WS.Storage);
};

const getContainerResources = (resource: URL): URL[] => {
  const fragments: string[] = resource.pathname.split("/");
  fragments.pop();
  const resources: URL[] = [];
  while (fragments.length > 0) {
    const pathname = fragments.join("/");
    const url = appendTrailingSlash(createUrl(pathname, resource));
    resources.push(url);
    fragments.pop();
  }
  return resources.reverse();
};

const findStorage = async (
  containerResources: URL[],
  options: { fetch: typeof fetch },
): Promise<URL | null> => {
  const containerResource = containerResources.pop();

  if (!containerResource) {
    return null;
  }

  const containerResponse = await options.fetch(containerResource, {
    method: "HEAD",
  });

  const link = containerResponse.headers.get("link");
  if (isStorage(link)) {
    return containerResource;
  }

  return findStorage(containerResources, options);
};

export const findDpcContainer = async (
  req: IncomingMessage,
  session: ProxySession,
): Promise<URL | null> => {
  if (!req.url) {
    return null;
  }

  const resource = updateUrl(req.url, PROXY.baseUrl);
  const containerResources = getContainerResources(resource);

  const storage = await findStorage(containerResources, {
    fetch: session.fetch,
  });

  if (storage) {
    return updateUrl(`/requests${storage.pathname}`, DPC.storage);
  }

  return null;
};
