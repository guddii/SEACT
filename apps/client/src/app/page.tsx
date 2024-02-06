import type { Metadata } from "next";
import { FormReadWrite, LayoutDefault } from "@seact/ui";
import type { ReactElement } from "react";
import { AGENTS, toUrlString } from "@seact/core";

export const metadata: Metadata = {
  title: "Read write solid pod",
  other: {
    breadcrumb: ["Client", "User Input"],
  },
};

export default function Page(): ReactElement {
  return (
    <LayoutDefault metadata={metadata}>
      <FormReadWrite resource={toUrlString(AGENTS.CLIENT.webId)} />
    </LayoutDefault>
  );
}
