import { AppSolid } from "@seact/ui";
import type { ReactElement, ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html lang="en">
      <AppSolid clientSession={false}>{children}</AppSolid>
    </html>
  );
}
