"use client";

import React, { createContext, useContext, useMemo } from "react";
import { DataRecord, TTableColumn } from "../table/type";
import {
  generateValidateFunction,
  TErrorValidation,
} from "../libs/generate-validate-function";

const ColsContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  validates: { [key: string]: (value: any) => boolean };
}>({
  cols: [],
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
  const validates = useMemo(
    () =>
      cols.reduce((acc, col) => {
        const { key } = col;

        acc[key] = generateValidateFunction(col as any, errorHandler);

        return acc;
      }, {} as { [key in keyof T]: (value: any) => boolean }),
    [cols]
  );

  const state = useMemo(() => ({ cols, validates }), [cols]);

  return (
    <ColsContext.Provider
      value={
        state as {
          cols: TTableColumn<DataRecord>[];
          validates: { [key: string]: (value: any) => boolean };
        }
      }
    >
      {children}
    </ColsContext.Provider>
  );
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
