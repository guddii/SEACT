import { cookies } from "next/headers";
import {
  Session,
  getSessionFromStorage,
} from "@inrupt/solid-client-authn-node";
import { getStorage } from "./session-storage.ts";

const COOKIE_NAME = "dpc";

export const getSession = async (): Promise<Session> => {
  const sessionId = cookies().get(COOKIE_NAME)?.value;
  if (!sessionId) {
    throw new Error("No sessionId in cookie");
  }

  const storage = getStorage();
  const session = await getSessionFromStorage(sessionId, storage);
  if (!session) {
    throw new Error("No session in internal storage");
  }

  return session;
};

export const infoResponse = async (): Promise<Response> => {
  const session = await setSessionCookie();

  return Response.json(session.info);
};

export const getWebId = async (session?: Session): Promise<string> => {
  const localSession = session || (await getSession());
  if (!localSession.info.webId) {
    throw new Error("No webId in session");
  }
  return localSession.info.webId;
};

export const setSessionCookie = async (): Promise<Session> => {
  let session: Session;
  try {
    session = await getSession();
  } catch (error: unknown) {
    const storage = getStorage();
    session = new Session({ storage });
    const oneDay = 24 * 60 * 60 * 1000;
    cookies().set({
      name: COOKIE_NAME,
      value: session.info.sessionId,
      maxAge: oneDay,
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    });
  }
  return session;
};
