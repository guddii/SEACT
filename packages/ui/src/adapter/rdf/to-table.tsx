import crypto from "node:crypto";
import { LDP } from "@inrupt/vocab-common-rdf";
import type { ValueOf } from "next/constants";
import type { ColumnsType } from "antd/es/table";
import React, { type Dispatch, type SetStateAction } from "react";
import Link from "next/link";

const urlToTitle = (eventuallyUrl: string): string => {
  try {
    return new URL(eventuallyUrl).hash.slice(1);
  } catch (error: unknown) {
    return eventuallyUrl;
  }
};

function mapColumns<T>(column: string): ValueOf<ColumnsType<T>> {
  const defaultColumn = {
    title: urlToTitle(column),
    dataIndex: column,
  };

  switch (column) {
    case LDP.contains:
      return {
        ...defaultColumn,
        render: (text: string | null) => {
          if (text) {
            const links = text.split(", ");
            return links.map((link) => {
              const href = link.replace("/api/", "/");
              const key = crypto.randomBytes(20).toString("hex");
              return (
                <div key={key}>
                  <Link href={href}>{link}</Link>
                  <br />
                </div>
              );
            });
          }
          return text;
        },
      };
    default:
      return defaultColumn;
  }
}

function getColumns<T extends Record<string, string>>(
  data: T[],
  excludeColumns?: string[],
): ValueOf<ColumnsType<T>>[] {
  const excludes = excludeColumns || [];
  return Array.from(new Set(Object.values(data).flatMap(Object.keys)))
    .filter((column: string): boolean => {
      return !excludes.includes(column);
    })
    .map(mapColumns<T>);
}

interface ToTableOptions<T extends Record<string, string>> {
  setColumns: Dispatch<SetStateAction<ColumnsType<T> | undefined>>;
  setData: Dispatch<SetStateAction<T[] | undefined>>;
  excludeColumns?: string[];
}

export function toTable<T extends Record<string, string>>(
  options: ToTableOptions<T>,
): (data: T[]) => void {
  const { setColumns, setData, excludeColumns } = options;
  return (data: T[]) => {
    const columns = getColumns(data, excludeColumns);
    setColumns(columns as ColumnsType<T>);
    setData(data);
  };
}
