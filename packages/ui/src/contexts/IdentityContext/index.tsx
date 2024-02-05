import type { UrlString, WebId } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getContainerResources } from "@seact/core";
import type { ServerSession } from "../../hooks/use-server-session.ts";
import { useServerSession } from "../../hooks/use-server-session.ts";

export interface IdentityContext {
  idp: UrlString;
  setIdp: Dispatch<SetStateAction<UrlString>>;
  currentUrl: UrlString;
  setCurrentUrl: Dispatch<SetStateAction<UrlString>>;
  webId: WebId;
  setWebId: Dispatch<SetStateAction<WebId>>;
  storage: UrlString;
  setStorage: Dispatch<SetStateAction<UrlString>>;
  sessionRequestInProgress: boolean;
  clientSession: boolean;
  session: ServerSession;
}

const IdentityContext = createContext<IdentityContext | undefined>(undefined);

interface IdentityProviderProps {
  children: ReactNode;
  clientSession?: boolean;
}

export function IdentityProvider({
  children,
  clientSession = true,
}: IdentityProviderProps): ReactElement {
  const { session, sessionRequestInProgress } = (
    clientSession ? useSession : useServerSession
  )();
  const [idp, setIdp] = useState("http://localhost:4000");
  const [currentUrl, setCurrentUrl] = useState("http://localhost:5000");
  const [webId, setWebId] = useState<string>("");
  const [storage, setStorage] = useState<UrlString>("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  useEffect(() => {
    if (session.info.webId) {
      setWebId(session.info.webId);
    }
  }, [session.info.webId]);

  useEffect(() => {
    if (webId) {
      const containerResources = getContainerResources(new URL(webId))
        .reverse()
        .map((containerResource) => containerResource.href);
      setStorage(containerResources[0]);
    }
  }, [webId]);

  const value: IdentityContext = {
    idp,
    setIdp,
    currentUrl,
    setCurrentUrl,
    webId,
    setWebId,
    storage,
    setStorage,
    sessionRequestInProgress,
    clientSession,
    session,
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContext {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error("useIdentity must be used within a IdentityProvider");
  }
  return context;
}
