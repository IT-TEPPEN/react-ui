"use client";

import React, { createContext, useContext, useMemo } from "react";
import { DataObject, DataRecord, TTableColumn } from "../type";
import {
  generateValidateFunction,
  TErrorValidation,
} from "../libs/generate-validate-function";
// import { useFocusContext } from "../edit/provider";

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
  validates: { [key: string]: (value: any) => boolean };
}>({
  cols: [],
  colMaps: {},
  validates: {},
});

export function ColumnsProvider<T extends DataRecord>({
  children,
  cols,
  errorHandler,
}: {
  children: React.ReactNode;
  cols: TTableColumn<T>[];
  errorHandler?: (errors: TErrorValidation[]) => void;
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

        acc[key] = generateValidateFunction(col as any, errorHandler);

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
