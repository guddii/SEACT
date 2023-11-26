import type { Metadata } from "next";
import { FormReadWrite } from "ui";

export const metadata: Metadata = {
  title: "Read write solid pod",
};

export default function Page(): React.ReactElement {
  return <FormReadWrite path="getting-started/readingList/myList" />;
}
