import { SessionProvider } from "@inrupt/solid-ui-react";
import { App, ConfigProvider } from "antd";
import type { ReactElement, ReactNode } from "react";
import { IdentityProvider } from "../../contexts/IdentityContext";
import theme from "../../themes/config";
import { StyledComponentsRegistry } from "../StyledComponentsRegistry";

interface AppSolidProps {
  children: ReactNode;
  clientSession?: boolean;
}

export function AppSolid({
  children,
  clientSession = true,
}: AppSolidProps): ReactElement {
  return (
    <body style={{ margin: 0 }}>
      <StyledComponentsRegistry>
        <App>
          <ConfigProvider theme={theme}>
            <SessionProvider>
              <IdentityProvider clientSession={clientSession}>
                {children}
              </IdentityProvider>
            </SessionProvider>
          </ConfigProvider>
        </App>
      </StyledComponentsRegistry>
    </body>
  );
}
