import { AppSolid } from "ui";
import type { ReactElement, ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html lang="en">
      <AppSolid>{children}</AppSolid>
    </html>
  );
}
