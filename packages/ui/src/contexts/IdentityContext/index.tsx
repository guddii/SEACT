import type { UrlString, WebId } from "@inrupt/solid-client";
import { getPodUrlAll } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { log } from "logger";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface IdentityContext {
  idp: UrlString;
  setIdp: Dispatch<SetStateAction<UrlString>>;
  currentUrl: UrlString;
  setCurrentUrl: Dispatch<SetStateAction<UrlString>>;
  webId: WebId;
  setWebId: Dispatch<SetStateAction<WebId>>;
  storageAll: UrlString[];
  storage: UrlString;
  setStorage: Dispatch<SetStateAction<UrlString>>;
}

const IdentityContext = createContext<IdentityContext | undefined>(undefined);

interface IdentityProviderProps {
  children: ReactNode;
}

export function IdentityProvider({
  children,
}: IdentityProviderProps): React.ReactElement {
  const { session } = useSession();
  const [idp, setIdp] = useState("http://localhost:3000");
  const [currentUrl, setCurrentUrl] = useState("http://localhost:4000");
  const [webId, setWebId] = useState<string>("");
  const [storageAll, setStorageAll] = useState<UrlString[]>([]);
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
      getPodUrlAll(webId)
        .then((podUrlAll) => {
          setStorageAll(podUrlAll);
          if (podUrlAll[0]) {
            setStorage(podUrlAll[0]);
          }
        })
        .catch((error) => {
          log(error);
        });
    }
  }, [webId]);

  const value: IdentityContext = {
    idp,
    setIdp,
    currentUrl,
    setCurrentUrl,
    webId,
    setWebId,
    storageAll,
    storage,
    setStorage,
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
