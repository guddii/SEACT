import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "@seact/ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { RDF } from "@inrupt/vocab-common-rdf";

export function generateMetadata(): Metadata {
  return {
    title: "Data",
    other: {
      breadcrumb: ["Data Privacy Cockpit"],
    },
  };
}

export default function Page(): ReactElement {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Table View",
      children: (
        <Box>
          <TableRDF
            excludeColumns={["key", "thing", RDF.type]}
            pathname="/api/data/"
          />
        </Box>
      ),
    },
  ];

  return (
    <LayoutDefault metadata={generateMetadata()}>
      <Tabs defaultActiveKey="1" items={items} type="card" />
    </LayoutDefault>
  );
}
