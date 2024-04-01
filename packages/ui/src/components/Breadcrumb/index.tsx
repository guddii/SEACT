import crypto from "node:crypto";
import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import type { BreadcrumbProps } from "antd";
import { Breadcrumb } from "antd";
import type { Metadata } from "next";
import { usePathname, useRouter } from "next/navigation";
import { createUrl, getContainerResources } from "@seact/core";

interface BreadcrumbDefaultProps {
  metadata: Metadata;
}

export function BreadcrumbDefault({
  metadata,
}: BreadcrumbDefaultProps): ReactElement | null {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null);

  const breadcrumbMetadata = metadata.other?.breadcrumb;
  let itemsFromMetadata: BreadcrumbProps["items"] = [];
  let itemsFromPath: BreadcrumbProps["items"] = [];

  if (Array.isArray(breadcrumbMetadata)) {
    itemsFromMetadata = breadcrumbMetadata.map((title: string | number) => {
      const key = crypto.randomBytes(20).toString("hex");
      return {
        key,
        title: String(title),
      };
    });
  }

  useEffect(() => {
    setCurrentUrl(new URL(window.location.origin));
  }, []);

  const titleFromPathname = (url: URL): string => {
    return (
      url.pathname
        .split("/")
        .filter((text) => text.length)
        .map(
          (pathSegment) => pathSegment[0].toUpperCase() + pathSegment.slice(1),
        )
        .pop() || ""
    );
  };

  if (currentUrl) {
    const containerResources: URL[] = getContainerResources(
      createUrl(pathname, currentUrl),
    ).reverse();

    itemsFromPath = containerResources.map((containerResource: URL) => {
      const key = crypto.randomBytes(20).toString("hex");
      return {
        key,
        title: titleFromPathname(containerResource),
        href: containerResource.href,
        onClick: (event) => {
          event.preventDefault();
          router.push(containerResource.href);
        },
      };
    });
  }

  // console.log(items);

  return <Breadcrumb items={[...itemsFromMetadata, ...itemsFromPath]} />;
}
