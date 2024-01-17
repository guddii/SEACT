export const toUrlString = (url: string | URL): string => {
  if (typeof url === "string") {
    return url;
  }
  return String(url);
};

export const createUrl = (url: string | URL, base?: string | URL): URL => {
  return new URL(toUrlString(url), base);
};

export const createUrlString = (
  url: string | URL,
  base?: string | URL,
): string => {
  return toUrlString(createUrl(url, base));
};

export const updateUrl = (patch: string | URL, base: URL): URL => {
  const patchUrl = createUrl(patch, base);
  const updatedUrl = createUrl(base);

  // Append pathname
  updatedUrl.pathname = base.pathname + patchUrl.pathname;
  // Replace hash if present
  updatedUrl.hash = patchUrl.hash || base.hash;
  // Append search params
  patchUrl.searchParams.forEach((param, name) => {
    updatedUrl.searchParams.append(name, param);
  });

  return updatedUrl;
};

export const updateUrlString = (patch: string, base: URL): string => {
  return toUrlString(updateUrl(patch, base));
};

export const removeHash = (url: URL): URL => {
  const urlWithoutHash = createUrl(url);
  urlWithoutHash.hash = "";
  return urlWithoutHash;
};
