"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { DataRecord, TTableColumn } from "../table/type";
import {
  generateValidateFunction,
  TErrorValidation,
  TValidateFunction,
} from "../libs/generate-validate-function";

type TValidates = { [key: string]: TValidateFunction };
import { useMessages } from "../locale/provider";

const ColsContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  validates: TValidates;
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

    const result: TValidates = {};
    for (const col of cols) {
      result[String(col.key)] = generateValidateFunction(
        // The column has what the validator needs (type, constraints,
        // options); its label may be missing, as before.
        { ...col, key: String(col.key), label: col.label as string },
        handleErrors
      );
    }
    return result;
  }, [cols, messages]);

  // Inside the table, rows have no own type (see TTableColumn<DataRecord>).
  const state = useMemo(
    () => ({ cols: cols as TTableColumn<DataRecord>[], validates }),
    [cols, validates]
  );

  return <ColsContext.Provider value={state}>{children}</ColsContext.Provider>;
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
