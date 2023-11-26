import { AppSolid } from "ui";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <AppSolid>{children}</AppSolid>
      </body>
    </html>
  );
}
