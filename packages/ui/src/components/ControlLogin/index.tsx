import { LoginButton, LogoutButton } from "@inrupt/solid-ui-react";
import { Button } from "antd";
import { log } from "logger";
import { useIdentity } from "../../contexts/IdentityContext";

export function ControlLogin(): React.ReactElement {
  const { idp, currentUrl, webId } = useIdentity();

  if (webId) {
    return (
      <LogoutButton
        onError={log}
        onLogout={() => {
          window.location.reload();
        }}
      >
        <Button>Logout</Button>
      </LogoutButton>
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
