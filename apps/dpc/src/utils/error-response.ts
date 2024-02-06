import { NetworkError } from "./error.ts";

export const errorResponse = (error: unknown): Response => {
  if (error instanceof NetworkError) {
    return Response.json(error, {
      status: error.status,
      statusText: error.statusText,
    });
  }
  if (error instanceof Error) {
    return Response.json(
      {
        message: error.message,
      },
      { status: 500, statusText: error.message },
    );
  }
  return Response.json(
    {
      message: " Internal Server Error",
    },
    { status: 500, statusText: "Internal Server Error" },
  );
};
