export const createContainerMeta = async (
  sourceIri: string,
  body: string[],
  options: {
    fetch: typeof fetch;
  },
): Promise<Response> => {
  return options.fetch(`${sourceIri}.meta`, {
    headers: {
      "Content-Type": "application/sparql-update",
    },
    method: "PATCH",
    body: body.join(";"),
  });
};
