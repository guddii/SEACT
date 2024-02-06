import { WS } from "@inrupt/vocab-solid";
import LinkHeader from "http-link-header";
import { appendTrailingSlash, createUrl } from "./url-helper.ts";

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

export const getContainerResources = (resource: URL, depth = 1): URL[] => {
  const fragments: string[] = resource.pathname.split("/");
  fragments.pop();
  const resources: URL[] = [];

  while (fragments.length > depth) {
    const pathname = fragments.join("/");
    const url = appendTrailingSlash(
      createUrl(pathname ? pathname : "/", resource),
    );
    resources.push(url);
    fragments.pop();
  }

  return resources;
};

export const findStorage = async (
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
