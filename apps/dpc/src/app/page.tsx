import type { Metadata } from "next";
import { Box, LayoutDefault, TableRDF } from "@seact/ui";
import type { ReactElement } from "react";
import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { HTTP } from "@inrupt/vocab-common-rdf";
import { AGENTS, updateUrlString } from "@seact/core";

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
            resource={updateUrlString(
              "/requests/client/connections",
              AGENTS.DPC.storage,
            )}
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
            resource={updateUrlString(
              "/requests/client/requests",
              AGENTS.DPC.storage,
            )}
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
            resource={updateUrlString(
              "/requests/client/responses",
              AGENTS.DPC.storage,
            )}
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
