export interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
}

export interface JWTPayload {
  webid?: string;
  jti?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  client_id?: string;
  iss?: string;
  aud?: string;
  cnf?: Record<string, string>;
}

export interface EncodedJWT {
  header: string;
  payload: string;
}

export interface JWT {
  header: JWTHeader;
  payload: JWTPayload;
}

export function parseEncodedJwt(
  authorizationHeader: string | null,
): EncodedJWT | null {
  if (!authorizationHeader) {
    return null;
  }

  try {
    const token = authorizationHeader.split(" ")[1];
    const tokenFragments = token.split(".");

    return {
      header: tokenFragments[0],
      payload: tokenFragments[1],
    };
  } catch (e) {
    return null;
  }
}

export function parseJwt(token: string | null): JWT | null {
  if (!token) {
    return null;
  }

  try {
    const encodedJwt = parseEncodedJwt(token);
    if (!encodedJwt) {
      return null;
    }

    const header = JSON.parse(
      Buffer.from(encodedJwt.header, "base64").toString(),
    ) as JWTHeader;
    const payload = JSON.parse(
      Buffer.from(encodedJwt.payload, "base64").toString(),
    ) as JWTPayload;

    return {
      header,
      payload,
    };
  } catch (e) {
    return null;
  }
}
