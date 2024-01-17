import { LoginButton, LogoutButton } from "@inrupt/solid-ui-react";
import { Button, Space } from "antd";
import type { ReactElement } from "react";
import { log } from "@seact/core";
import { useIdentity } from "../../contexts/IdentityContext";

export function ControlLogin(): ReactElement {
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
    <LoginButton
      authOptions={{ clientName: currentUrl }}
      oidcIssuer={idp}
      onError={log}
      redirectUrl={currentUrl}
    >
      <Button>Login</Button>
    </LoginButton>
  );
}
