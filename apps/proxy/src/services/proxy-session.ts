import type http from "node:http";
import type { ILoginInputOptions } from "@inrupt/solid-client-authn-node";
import { isSuccessfulResponse, APPS } from "@seact/core";
import type { Request } from "express";
import {
  fetchWithSkipHeader,
  hasSkipHeader,
} from "../utils/fetch-with-skip-header.ts";
import { oidcDiscovery } from "../utils/oidc-discovery.ts";

interface ProxyLoginInputOptions extends ILoginInputOptions {
  webId: URL;
}

export class ProxySession {
  webId: URL | undefined;
  token: Record<string, string> = {};
  public readonly info: Record<string, boolean> = { isLoggedIn: false };

  login = async (options: ProxyLoginInputOptions): Promise<void> => {
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

    const oidcConfig = await oidcDiscovery();
    if (!oidcConfig) {
      throw new Error("Could not find OIDC Configuration");
    }

    const response: Response = await fetchWithSkipHeader(
      oidcConfig.token_endpoint,
      {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: urlSearchParams.toLocaleString(),
      },
    );

    if (isSuccessfulResponse(response)) {
      const data = await response.json();
      this.token = data as Record<string, string>;
      this.info.isLoggedIn = true;
      this.webId = options.webId;
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

  static isAgentRequest(
    req: Request | http.IncomingMessage,
    agent: { webId: URL | undefined },
  ): boolean {
    if (!req.url) {
      return true;
    }
    if (agent.webId) {
      return req.url.startsWith(agent.webId.pathname);
    }
    return false;
  }

  static isOidcConfigRequest(req: Request | http.IncomingMessage): boolean {
    return req.url === APPS.PROXY.openidConfigurationUrl.pathname;
  }

  static isInternalServerRequest(req: Request | http.IncomingMessage): boolean {
    if (!req.url) {
      return true;
    }
    return req.url.startsWith("/.");
  }

  static isSelfRequest(req: Request | http.IncomingMessage): boolean {
    return hasSkipHeader(req);
  }

  static isLoggableRequest(
    req: Request | http.IncomingMessage,
    strict?: boolean,
  ): boolean {
    if (!APPS.PROXY.featureLogging) {
      return false;
    }

    if (strict) {
      return !(
        ProxySession.isSelfRequest(req) ||
        ProxySession.isOidcConfigRequest(req) ||
        ProxySession.isAgentRequest(req, session)
      );
    }

    return !(
      ProxySession.isSelfRequest(req) ||
      ProxySession.isInternalServerRequest(req) ||
      ProxySession.isAgentRequest(req, session)
    );
  }
}

const session = new ProxySession();

export const getAgentUserSession = async ({
  webId,
  clientId,
  clientSecret,
  oidcIssuer,
}: ProxyLoginInputOptions): Promise<ProxySession> => {
  if (session.info.isLoggedIn) {
    return session;
  }

  await session.login({
    webId,
    clientId,
    clientSecret,
    oidcIssuer,
  });

  return session;
};
