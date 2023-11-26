import { SessionProvider } from "@inrupt/solid-ui-react";
import { App, ConfigProvider } from "antd";
import { IdentityProvider } from "../../contexts/IdentityContext";
import theme from "../../themes/config";
import { StyledComponentsRegistry } from "../StyledComponentsRegistry";

interface AppSolidProps {
  children: React.ReactNode;
}

export function AppSolid({ children }: AppSolidProps): React.ReactElement {
  return (
    <StyledComponentsRegistry>
      <App>
        <ConfigProvider theme={theme}>
          <SessionProvider sessionId="session-provider-example">
            <IdentityProvider>{children}</IdentityProvider>
          </SessionProvider>
        </ConfigProvider>
      </App>
    </StyledComponentsRegistry>
  );
}
