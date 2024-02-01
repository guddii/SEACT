import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { Flex, App, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useIdentity } from "../../contexts/IdentityContext";
import { getDatasetAsMatrix } from "../../utils/get-dataset-as-matrix.ts";
import { toTable } from "../../adapter/rdf/to-table";
import { ControlClaim } from "../ControlClaim";

interface TableRDFProps extends TableProps<Record<string, string>> {
  resource: string;
  excludeColumns?: string[];
  showInExpander?: string;
}
export function TableRDF({
  resource,
  excludeColumns,
  showInExpander,
  ...args
}: TableRDFProps): ReactElement {
  const { webId, session } = useIdentity();
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
    getDatasetAsMatrix(resource, { session })
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
  }, [excludeColumns, message, resource, session, webId]);

  const boxStyle: React.CSSProperties = {
    width: "100%",
    height: 60,
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        expandable={expandable}
        loading={loading}
        {...args}
      />
      <Flex align="center" justify="center" style={boxStyle}>
        <ControlClaim />
      </Flex>
    </>
  );
}
