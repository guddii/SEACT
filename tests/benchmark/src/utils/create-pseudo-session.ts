import type { GetAccessTokenResponse } from "./get-access-token.ts";

export interface PseudoSession {
  fetch: typeof fetch;
}

export function createPseudoSession(
  accessTokenResponse: GetAccessTokenResponse,
): PseudoSession {
  const authFetch: typeof fetch = async (input, init) => {
    const authHeaders: RequestInit["headers"] = {
      authorization: `${accessTokenResponse.token_type} ${accessTokenResponse.access_token}`,
      "X-Proxy-Bypass-Token": process.env.PROXY_BYPASS_TOKEN || "",
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

  return { fetch: authFetch };
}
