import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { HTTP } from "@inrupt/vocab-common-rdf";

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
            excludeColumns={[HTTP.requests]}
            ressource={`${process.env.DPC_STORAGE}/requests/client/connections`}
            showInExpander={HTTP.requests}
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
            ressource={`${process.env.DPC_STORAGE}/requests/client/requests`}
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
            ressource={`${process.env.DPC_STORAGE}/requests/client/responses`}
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
