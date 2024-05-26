interface OidcToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface GetAccessTokenResponse extends OidcToken {
  name: string;
}

export async function getAccessToken(
  name: string | undefined,
  id: string | undefined,
  secret: string | undefined,
): Promise<GetAccessTokenResponse> {
  if (!name || !id || !secret) {
    throw new Error("Credentials missing");
  }

  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;

  const tokenUrl = "http://proxy.localhost:4000/.oidc/token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=webid",
  });

  const json = (await response.json()) as OidcToken;

  return { ...json, name };
}
