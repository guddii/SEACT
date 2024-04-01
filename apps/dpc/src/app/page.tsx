import type { Metadata } from "next";
import type { ReactElement } from "react";
import dataPage, {
  generateMetadata as generateDataMetadata,
} from "./data/page";

export function generateMetadata(): Metadata {
  return generateDataMetadata();
}

export default function Page(): ReactElement {
  return dataPage();
}
