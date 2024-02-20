import { randomUUID } from "node:crypto";
import type { Request } from "express";

export const SKIP_REQ_HEADER_KEY = "X-Skip";
export const SKIP_REQ_HEADER_VAL = randomUUID();

export const fetchWithSkipHeader: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  headers.set(SKIP_REQ_HEADER_KEY, SKIP_REQ_HEADER_VAL);

  const newInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, newInit);
};

export const hasSkipHeader = (req: Request): boolean => {
  const skipHeader = req.headers[SKIP_REQ_HEADER_KEY.toLowerCase()] || "";
  return skipHeader === SKIP_REQ_HEADER_VAL;
};
