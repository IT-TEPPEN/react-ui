"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DataRecord, TTableColumn } from "../table/type";
import {
  generateValidateFunction,
  TErrorValidation,
  TValidateFunction,
} from "../libs/generate-validate-function";

type TValidates = { [key: string]: TValidateFunction };
import { useMessages } from "../locale/provider";

type TErrorSink = (errors: TErrorValidation[]) => void;

const ColsContext = createContext<{
  cols: TTableColumn<DataRecord>[];
  validates: TValidates;
}>({
  cols: [],
  validates: {},
});

// Where validation errors go while a cell editor is open (see
// useValidationErrorSink). Returns a function that stops it.
const ErrorSinkContext = createContext<(sink: TErrorSink) => () => void>(
  () => () => {}
);

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

  // The cell editor that is open shows errors in the table. Pastes and other
  // checks without an editor still use window.alert.
  const sinkRef = useRef<TErrorSink | null>(null);
  const [setErrorSink] = useState(() => (sink: TErrorSink) => {
    sinkRef.current = sink;
    return () => {
      if (sinkRef.current === sink) sinkRef.current = null;
    };
  });

  const validates = useMemo(() => {
    const handleErrors = (errors: TErrorValidation[]) => {
      if (errorHandlerRef.current) {
        errorHandlerRef.current(errors);
        // The editor still marks the cell (without a message of its own).
        sinkRef.current?.([]);
      } else if (sinkRef.current) {
        sinkRef.current(errors);
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

  return (
    <ColsContext.Provider value={state}>
      <ErrorSinkContext.Provider value={setErrorSink}>
        {children}
      </ErrorSinkContext.Provider>
    </ColsContext.Provider>
  );
}

/**
 * While the calling editor is mounted, validation errors are passed to
 * `sink` instead of window.alert: the errors, or [] when the app's
 * errorHandler has already shown them.
 */
export function useValidationErrorSink(sink: TErrorSink) {
  const setErrorSink = useContext(ErrorSinkContext);
  const latest = useRef(sink);
  latest.current = sink;
  useEffect(() => setErrorSink((errors) => latest.current(errors)), []);
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
