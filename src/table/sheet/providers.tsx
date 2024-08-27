"use client";

import React, { createContext, useContext, useMemo } from "react";
import { DataObject, DataRecord, TPropsTable, TTableColumn } from "../type";
import { useTable } from "../hook";
import { generateValidateFunction } from "../libs/generate-validate-function";
// import { useFocusContext } from "../edit/provider";

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
  const state = useMemo(
    () => row,
    [
      Object.keys(row)
        .sort()
        .reduce((acc, key) => {
          acc[key] = row[key];
          return acc;
        }, {} as DataObject<DataRecord>),
    ]
  );

  return <RowContext.Provider value={state}>{children}</RowContext.Provider>;
}

export function useRowContext() {
  return useContext(RowContext);
}

const ColsContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  colMaps: {
    [key: string]: TTableColumn<DataRecord>;
  };
  validates: { [key: string]: (value: any) => boolean };
}>({
  cols: [],
  colMaps: {},
  validates: {},
});

export function ColumnsProvider<T extends DataRecord>({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: TTableColumn<T>[];
}) {
  const colMaps = useMemo(
    () =>
      cols.reduce((acc, col) => {
        const { key } = col;
        acc[key] = col;
        return acc;
      }, {} as { [key in keyof T]: TTableColumn<T> }),
    [cols]
  );

  const validates = useMemo(
    () =>
      cols.reduce((acc, col) => {
        const { key } = col;

        acc[key] = generateValidateFunction(col);

        return acc;
      }, {} as { [key in keyof T]: (value: any) => boolean }),
    [cols]
  );

  const state = useMemo(() => ({ cols, colMaps, validates }), [cols]);

  return (
    <ColsContext.Provider
      value={
        state as {
          cols: TTableColumn<DataRecord>[];
          colMaps: {
            [key: string]: TTableColumn<DataRecord>;
          };
          validates: { [key: string]: (value: any) => boolean };
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

export function useColumnValidateContext(key: string) {
  return useContext(ColsContext).validates[key];
}

export function useColumnValidatesContext() {
  return useContext(ColsContext).validates;
}
