import type { ILoginInputOptions } from "@inrupt/solid-client-authn-node";
import { Session } from "@inrupt/solid-client-authn-node";

const session = new Session();

export const getAgentUserSession = async ({
  clientId,
  clientSecret,
  oidcIssuer,
}: ILoginInputOptions): Promise<Session> => {
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
