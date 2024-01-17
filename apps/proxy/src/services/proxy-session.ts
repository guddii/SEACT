import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { ILoginInputOptions } from "@inrupt/solid-client-authn-node";
import { PROXY, toUrlString } from "core";

const SKIP_REQ_HEADER_VAL = randomUUID();

export class ProxySession {
  public static SKIP_REQ_HEADER_KEY = "x-skip";
  token: Record<string, string> = {};
  public readonly info: Record<string, boolean> = { isLoggedIn: false };

  async login(options: ILoginInputOptions): Promise<void> {
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

    const response = await fetch(toUrlString(PROXY.tokenUrl), {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
        [ProxySession.SKIP_REQ_HEADER_KEY]: SKIP_REQ_HEADER_VAL,
      },
      body: urlSearchParams.toLocaleString(),
    });

    const data = await response.json();
    this.token = data as Record<string, string>;
    this.info.isLoggedIn = true;
  }

  fetch: typeof fetch = async (input, init) => {
    const authHeaders: RequestInit["headers"] = {
      Authorization: `${this.token.token_type} ${this.token.access_token}`,
      [ProxySession.SKIP_REQ_HEADER_KEY]: SKIP_REQ_HEADER_VAL,
    };

    const headers: RequestInit["headers"] = {
      ...init?.headers,
      ...authHeaders,
    };

    return fetch(input, {
      ...init,
      headers,
    });
  };

  static isOwnRequest(req: IncomingMessage): boolean {
    const skipHeader = req.headers[ProxySession.SKIP_REQ_HEADER_KEY] || "";
    return skipHeader !== SKIP_REQ_HEADER_VAL;
  }
}

const session = new ProxySession();

export const getAgentUserSession = async ({
  clientId,
  clientSecret,
  oidcIssuer,
}: ILoginInputOptions): Promise<ProxySession | null> => {
  if (!clientId || !clientSecret || !oidcIssuer) {
    return null;
  }

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
