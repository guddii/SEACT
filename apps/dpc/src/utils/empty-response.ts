export const emptyResponse = (): Response => {
  return new Response("", {
    headers: {
      "Content-Type": "text/turtle",
    },
  });
};
