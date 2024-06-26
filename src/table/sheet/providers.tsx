"use client";

import { createContext, useContext } from "react";
import { DataObject, DataRecord, TColumnType, TTableColumn } from "../type";

const RowContext = createContext<DataObject<DataRecord>>({
  id: "",
});

export function RowProvider({
  children,
  row,
}: {
  children: React.ReactNode;
  row: DataObject<DataRecord>;
}) {
  return <RowContext.Provider value={row}>{children}</RowContext.Provider>;
}

export function useRowContext() {
  return useContext(RowContext);
}

const ColsContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  colMaps: {
    [key: string]: TTableColumn<DataRecord>;
  };
}>({
  cols: [],
  colMaps: {},
});

export function ColumnsProvider<T extends DataRecord>({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: TTableColumn<T>[];
}) {
  const colMaps = cols.reduce((acc, col) => {
    const { key } = col;
    acc[key] = col;
    return acc;
  }, {} as { [key in keyof T]: TTableColumn<T> });

  return (
    <ColsContext.Provider
      value={
        { cols, colMaps } as {
          cols: TTableColumn<DataRecord>[];
          colMaps: {
            [key: string]: TTableColumn<DataRecord>;
          };
        }
      }
    >
      {children}
    </ColsContext.Provider>
  );
}

export function useColumnContext(key: string) {
  return useContext(ColsContext).colMaps[key];
}

export function useColumnsContext() {
  return useContext(ColsContext).cols;
}

const CellContext = createContext<{
  columnKey: string;
  value: any;
  label: any;
  type: TColumnType;
  editable?: boolean;
  render?: (value: any, row: DataObject<DataRecord>) => React.ReactNode;
  rowIndex: number;
  colIndex: number;
}>({
  columnKey: "",
  value: "",
  label: "",
  type: "string",
  rowIndex: 0,
  colIndex: 0,
});

export function CellProvider({
  children,
  columnKey,
  rowIndex,
  colIndex,
}: {
  children: React.ReactNode;
  columnKey: string;
  rowIndex: number;
  colIndex: number;
}) {
  const col = useColumnContext(columnKey);
  const row = useRowContext();
  const value = row[columnKey];
  return (
    <CellContext.Provider
      value={{
        columnKey,
        value,
        label:
          col.type === "select"
            ? col.options?.find((op) => op.value === value)?.label
            : value,
        editable: col.editable,
        render: col.editable ? undefined : col.render,
        type: col.type,
        rowIndex,
        colIndex,
      }}
    >
      {children}
    </CellContext.Provider>
  );
}

export function useCellContext() {
  return useContext(CellContext);
}
