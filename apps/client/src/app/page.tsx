import type { Metadata } from "next";
import { FormReadWrite } from "ui";
import type { ReactElement } from "react";

export const metadata: Metadata = {
  title: "Read write solid pod",
};

export default function Page(): ReactElement {
  return <FormReadWrite path="/myFile0" />;
}
