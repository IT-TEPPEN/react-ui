"use client";

import { createContext, useContext } from "react";
import {
  DataObject,
  TCellEditingCondition,
  TColumnType,
  TTableColumn,
} from "../type";

const RowContext = createContext<DataObject>({
  id: "",
});

export function RowProvider({
  children,
  row,
}: {
  children: React.ReactNode;
  row: DataObject;
}) {
  return <RowContext.Provider value={row}>{children}</RowContext.Provider>;
}

export function useRowContext() {
  return useContext(RowContext);
}

const ColsContext = createContext<{
  cols: TTableColumn[];
  colMaps: {
    [key: string]: { label?: string } & TCellEditingCondition;
  };
}>({
  cols: [],
  colMaps: {},
});

export function ColumnsProvider({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: TTableColumn[];
}) {
  const colMaps = cols.reduce((acc, col) => {
    const { key, ...other } = col;
    acc[key] = other;
    return acc;
  }, {} as { [key: string]: { label?: string } & TCellEditingCondition });

  return (
    <ColsContext.Provider value={{ cols, colMaps }}>
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
  render?: (value: any, row: DataObject) => React.ReactNode;
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
