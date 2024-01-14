import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { App, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UrlString } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useIdentity } from "../../contexts/IdentityContext";
import { getDatasetAsMatrix } from "../../utils/get-dataset-as-matrix.ts";
import { toTable } from "../../adapter/rdf/to-table.tsx";

interface TableRDFProps extends TableProps<Record<string, string>> {
  ressource: UrlString;
  excludeColumns?: string[];
  showInExpander?: string;
}
export function TableRDF({
  ressource,
  excludeColumns,
  showInExpander,
  ...args
}: TableRDFProps): ReactElement {
  const { session } = useSession();
  const { webId } = useIdentity();
  const { message } = App.useApp();

  const [columns, setColumns] = useState<
    ColumnsType<Record<string, string>> | undefined
  >();
  const [data, setData] = useState<Record<string, string>[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  let expandable;
  if (showInExpander) {
    expandable = {
      expandedRowRender: (record: Record<string, string>): string =>
        record[showInExpander],
      rowExpandable: (record: Record<string, string>): boolean =>
        Boolean(record[showInExpander]),
    };
  }

  useEffect(() => {
    getDatasetAsMatrix(ressource, { session })
      .then(toTable({ setColumns, setData, excludeColumns }))
      .catch((error: Error) => {
        void message.open({
          type: "error",
          content: error.toString(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [excludeColumns, message, ressource, session, webId]);

  return (
    <Table
      columns={columns}
      dataSource={data}
      expandable={expandable}
      loading={loading}
      {...args}
    />
  );
}
