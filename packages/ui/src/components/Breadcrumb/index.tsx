import type { ReactElement } from "react";
import React from "react";
import type { BreadcrumbProps } from "antd";
import { Breadcrumb } from "antd";
import type { Metadata } from "next";

interface BreadcrumbDefaultProps {
  metadata: Metadata;
}

export function BreadcrumbDefault({
  metadata,
}: BreadcrumbDefaultProps): ReactElement | null {
  const breadcrumbMetadata = metadata.other?.breadcrumb;
  let items: BreadcrumbProps["items"];

  if (Array.isArray(breadcrumbMetadata)) {
    items = breadcrumbMetadata.map((title: string | number) => {
      return { title: String(title) };
    });
  } else {
    return null;
  }

  return <Breadcrumb items={items} />;
}
