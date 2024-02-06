type ContentType = "text/turtle";

export const emptyResponse = (contentType?: ContentType): Response => {
  switch (contentType) {
    case "text/turtle":
      return new Response("", {
        status: 200,
        headers: {
          "Content-Type": "text/turtle",
        },
      });
    default:
      return Response.json(
        {},
        {
          status: 200,
        },
      );
  }
};
