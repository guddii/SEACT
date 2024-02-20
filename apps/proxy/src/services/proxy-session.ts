import type { ILoginInputOptions } from "@inrupt/solid-client-authn-node";
import { APPS, isSuccessfulResponse } from "@seact/core";
import type { Request } from "express";
import {
  fetchWithSkipHeader,
  hasSkipHeader,
} from "../utils/fetch-with-skip-header.ts";

export class ProxySession {
  token: Record<string, string> = {};
  public readonly info: Record<string, boolean> = { isLoggedIn: false };

  login = async (options: ILoginInputOptions): Promise<void> => {
    if (!options.clientId) {
      throw new Error("clientId is required");
    }
    if (!options.clientSecret) {
      throw new Error("clientSecret is required");
    }
    const client = {
      id: encodeURIComponent(options.clientId),
      secret: encodeURIComponent(options.clientSecret),
    };
    const authString = `${client.id}:${client.secret}`;

    const urlSearchParams = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "webid",
    });

    const response: Response = await fetchWithSkipHeader(APPS.PROXY.tokenUrl, {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: urlSearchParams.toLocaleString(),
    });

    if (isSuccessfulResponse(response)) {
      const data = await response.json();
      this.token = data as Record<string, string>;
      this.info.isLoggedIn = true;
    }
  };

  fetch: typeof fetch = async (input, init) => {
    const authHeaders: RequestInit["headers"] = {
      authorization: `${this.token.token_type} ${this.token.access_token}`,
    };

    const headers: RequestInit["headers"] = {
      ...init?.headers,
      ...authHeaders,
    };

    return fetchWithSkipHeader(input, {
      ...init,
      headers,
    });
  };

  static isServerRequest(req: Request): boolean {
    // TODO: Replace with actual server sender filtering
    return [
      "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
      "node",
    ].includes(req.headers["user-agent"] || "node");
  }

  static isOwnRequest(req: Request): boolean {
    return hasSkipHeader(req);
  }
}

const session = new ProxySession();

export const getAgentUserSession = async ({
  clientId,
  clientSecret,
  oidcIssuer,
}: ILoginInputOptions): Promise<ProxySession> => {
  if (session.info.isLoggedIn) {
    return session;
  }

  await session.login({
    clientId,
    clientSecret,
    oidcIssuer,
  });

  return session;
};
