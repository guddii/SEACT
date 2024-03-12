import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "@seact/ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { RDF } from "@inrupt/vocab-common-rdf";
import { APPS, updateUrlString } from "@seact/core";

export const metadata: Metadata = {
  title: "Logs",
  other: {
    breadcrumb: ["Client", "Data Privacy Cockpit"],
  },
};

export default function Page(): ReactElement {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Access Logs",
      children: (
        <Box>
          <TableRDF
            excludeColumns={["key", "thing", RDF.type]}
            resource={updateUrlString("/api/log/accessLog", APPS.DPC.baseUrl)}
          />
        </Box>
      ),
    },
  ];

  return (
    <LayoutDefault metadata={metadata}>
      <Tabs defaultActiveKey="1" items={items} type="card" />
    </LayoutDefault>
  );
}
