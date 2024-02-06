import type { ISessionInfo } from "@inrupt/solid-client-authn-core";
import { useEffect, useState } from "react";

interface InfoResponse {
  sessionId?: string;
  isLoggedIn?: boolean;
  webId?: string;
}

export interface ServerSession {
  fetch: typeof fetch;
  info: ISessionInfo;
}

export interface UseServerSession {
  sessionRequestInProgress: boolean;
  session: ServerSession;
}

export const useServerSession = (): UseServerSession => {
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [webId, setWebId] = useState<string>("");
  const [sessionRequestInProgress, setSessionRequestInProgress] =
    useState<boolean>(true);

  useEffect(() => {
    void fetch("/info").then((response) => {
      void response
        .json()
        .then((info: InfoResponse) => {
          info.sessionId && setSessionId(info.sessionId);
          info.isLoggedIn && setIsLoggedIn(info.isLoggedIn);
          info.webId && setWebId(info.webId);
        })
        .finally(() => {
          setSessionRequestInProgress(false);
        });
    });
  }, [setWebId]);

  return {
    sessionRequestInProgress,
    session: {
      fetch,
      info: {
        sessionId,
        isLoggedIn,
        webId,
      },
    },
  };
};
