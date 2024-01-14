import type { Metadata } from "next";
import { FormReadWrite, LayoutDefault } from "ui";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Read write solid pod",
  other: {
    breadcrumb: ["Client", "User Input"],
  },
};

export default function Page(): ReactElement {
  const ressource = `${process.env.CLIENT_WEB_ID}`;
  return (
    <LayoutDefault metadata={metadata}>
      <FormReadWrite ressource={ressource} />
    </LayoutDefault>
  );
}
