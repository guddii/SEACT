import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "@seact/ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { HTTP, RDF } from "@inrupt/vocab-common-rdf";
import { APPS, updateUrlString } from "@seact/core";

export const metadata: Metadata = {
  title: "Access Logs",
  other: {
    breadcrumb: ["Client", "Data Privacy Cockpit"],
  },
};

export default function Page(): ReactElement {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Connections",
      children: (
        <Box>
          <TableRDF
            excludeColumns={["key", RDF.type, HTTP.requests]}
            resource={updateUrlString("/api/log/connections", APPS.DPC.baseUrl)}
          />
        </Box>
      ),
    },
    {
      key: "2",
      label: "Requests",
      children: (
        <Box>
          <TableRDF
            excludeColumns={["key", RDF.type]}
            resource={updateUrlString("/api/log/requests", APPS.DPC.baseUrl)}
          />
        </Box>
      ),
    },
    {
      key: "3",
      label: "Responses",
      children: (
        <Box>
          <TableRDF
            excludeColumns={["key", RDF.type]}
            resource={updateUrlString("/api/log/responses", APPS.DPC.baseUrl)}
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
