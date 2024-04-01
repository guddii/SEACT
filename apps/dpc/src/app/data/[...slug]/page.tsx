import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "@seact/ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { VOCAB } from "@seact/core";
import { RDF } from "@inrupt/vocab-common-rdf";

interface PageProps {
  params: { slug: string[] };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: params.slug[params.slug.length - 1] || "",
    other: {
      breadcrumb: ["Data Privacy Cockpit"],
    },
  };
}

export default function Page({ params }: PageProps): ReactElement {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Table View",
      children: (
        <Box>
          <TableRDF
            excludeColumns={[
              "key",
              "thing",
              RDF.type,
              VOCAB.INTEROP.registeredAt,
              VOCAB.INTEROP.registeredBy,
            ]}
          />
        </Box>
      ),
    },
  ];

  return (
    <LayoutDefault metadata={generateMetadata({ params })}>
      <Tabs defaultActiveKey="1" items={items} type="card" />
    </LayoutDefault>
  );
}
