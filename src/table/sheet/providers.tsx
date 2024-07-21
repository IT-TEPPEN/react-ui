"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  DataObject,
  DataRecord,
  TColumnType,
  TPropsTable,
  TTableColumn,
} from "../type";
import { useTable } from "../hook";
import { useFocusContext } from "../edit/provider";

const ProcessedDataContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  rows: DataObject<DataRecord>[];
}>({
  cols: [],
  rows: [],
});

export function ProcessedDataProvider<T extends DataRecord>({
  children,
  props,
}: {
  children: React.ReactNode;
  props: TPropsTable<T>;
}) {
  const { cols, rows } = useTable<T>(props);
  return (
    <ProcessedDataContext.Provider
      value={
        { cols, rows } as {
          cols: TTableColumn<DataRecord>[];
          rows: DataObject<DataRecord>[];
        }
      }
    >
      {children}
    </ProcessedDataContext.Provider>
  );
}

export function useProcessedDataContext() {
  return useContext(ProcessedDataContext);
}

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
  type: TColumnType | "component";
  editable?: boolean;
  component?: React.ReactNode;
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

const CellFocusContext = createContext<boolean>(false);

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
  const { checkFocus } = useFocusContext();
  const value = row[columnKey];
  const isFocus = checkFocus(rowIndex, colIndex);

  const label =
    col.type === "select"
      ? col.options?.find((op) => op.value === value)?.label
      : value;

  const component = useMemo(() => {
    if (col.editable) {
      return label;
    } else {
      return col.render ? col.render(value as never, row) : value;
    }
  }, [col.editable, label, value, row]);

  return (
    <CellContext.Provider
      value={{
        columnKey,
        value,
        label,
        editable: col.editable,
        component: component,
        type: !col.editable && col.render ? "component" : col.type,
        rowIndex,
        colIndex,
      }}
    >
      <CellFocusContext.Provider value={isFocus}>
        {children}
      </CellFocusContext.Provider>
    </CellContext.Provider>
  );
}

export function useCellContext() {
  return useContext(CellContext);
}

export function useCellIsFocusContext() {
  return useContext(CellFocusContext);
}
