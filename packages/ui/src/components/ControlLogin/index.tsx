import { LoginButton, LogoutButton } from "@inrupt/solid-ui-react";
import { Button, Space } from "antd";
import type { ReactElement } from "react";
import { log } from "@seact/core";
import { useIdentity } from "../../contexts/IdentityContext";

export function ControlLogin(): ReactElement {
  const { clientSession, sessionRequestInProgress } = useIdentity();

  if (sessionRequestInProgress) {
    return (
      <Space>
        <Button disabled loading type="text">
          Loading
        </Button>
      </Space>
    );
  }

  if (clientSession) {
    return <ControlLoginClientSide />;
  }
  return <ControlLoginServerSide />;
}

export function ControlLoginClientSide(): ReactElement {
  const { idp, currentUrl, webId } = useIdentity();

  if (webId) {
    return (
      <Space>
        <Button type="text">{webId}</Button>
        <LogoutButton
          onError={log}
          onLogout={() => {
            window.location.reload();
          }}
        >
          <Button>Logout</Button>
        </LogoutButton>
      </Space>
    );
  }

  return (
    <Space>
      <LoginButton
        authOptions={{ clientName: currentUrl }}
        oidcIssuer={idp}
        onError={log}
        redirectUrl={currentUrl}
      >
        <Button>Login</Button>
      </LoginButton>
    </Space>
  );
}

export function ControlLoginServerSide(): ReactElement {
  const { webId } = useIdentity();
  const referrer = () => {
    return `referrer=${encodeURIComponent(globalThis.location.href)}`;
  };

  if (webId) {
    return (
      <Space>
        <Button type="text">{webId}</Button>
        <Button href={`/logout?${referrer()}`}>Logout</Button>
      </Space>
    );
  }

  return (
    <Space>
      <Button href={`/login?${referrer()}`}>Login</Button>
    </Space>
  );
}
