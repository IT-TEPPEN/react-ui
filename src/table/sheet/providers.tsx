"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { DataRecord, TTableColumn } from "../table/type";
import {
  generateValidateFunction,
  TErrorValidation,
} from "../libs/generate-validate-function";
import { useMessages } from "../locale/provider";

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
  const messages = useMessages();

  // Call the latest errorHandler without rebuilding the validators (and
  // re-rendering every cell) when the app passes a new function.
  const errorHandlerRef = useRef(errorHandler);
  useEffect(() => {
    errorHandlerRef.current = errorHandler;
  });

  const validates = useMemo(() => {
    const handleErrors = (errors: TErrorValidation[]) => {
      if (errorHandlerRef.current) {
        errorHandlerRef.current(errors);
      } else {
        alert(messages.validation(errors));
      }
    };

    return cols.reduce((acc, col) => {
      const { key } = col;

      acc[key] = generateValidateFunction(col as any, handleErrors);

      return acc;
    }, {} as { [key in keyof T]: (value: any) => boolean });
  }, [cols, messages]);

  const state = useMemo(() => ({ cols, validates }), [cols, validates]);

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
