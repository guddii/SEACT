import type { ReactElement, ReactNode } from "react";
import { theme } from "antd";

export interface BoxProps {
  children: ReactNode;
}

export function Box({ children }: BoxProps): ReactElement {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <div
      style={{
        marginTop: "-16px",
        padding: 24,
        background: colorBgContainer,
        borderLeft: "1px solid #f0f0f0",
        borderRight: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {children}
    </div>
  );
}
