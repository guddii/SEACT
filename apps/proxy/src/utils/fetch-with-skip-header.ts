import type http from "node:http";
import type { Request } from "express";
import { APPS } from "@seact/core";

export const SKIP_REQ_HEADER_KEY = "X-Skip";
export const SKIP_REQ_HEADER_VAL = APPS.PROXY.bypassToken;

export const fetchWithSkipHeader: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  headers.set(SKIP_REQ_HEADER_KEY, SKIP_REQ_HEADER_VAL);

  const newInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, newInit);
};

export const hasSkipHeader = (req: Request | http.IncomingMessage): boolean => {
  const skipHeader = req.headers[SKIP_REQ_HEADER_KEY.toLowerCase()] || "";
  return skipHeader === SKIP_REQ_HEADER_VAL;
};
