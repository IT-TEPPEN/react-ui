"use client";

import { createContext, useContext } from "react";
import { TPageContext } from "./types";
import { usePageReducer } from "./hooks";
import { DataObject } from "../type";

const PageContext = createContext<TPageContext>({
  perPage: 0,
  current: 0,
  pageCount: 0,
  from: 0,
  to: 0,
  rowCount: 0,
  next: function (): void {
    throw new Error("Function not implemented.");
  },
  prev: function (): void {
    throw new Error("Function not implemented.");
  },
  jump: function (): void {
    throw new Error("Function not implemented.");
  },
  setRowCount: function (): void {
    throw new Error("Function not implemented.");
  },
  pageFilter: function (): DataObject[] {
    throw new Error("Function not implemented.");
  },
});

export function PagenationProvider(props: {
  children: React.ReactNode;
  rowCount: number;
  perPage?: number;
  currentPage?: number;
}) {
  return (
    <PageContext.Provider
      value={usePageReducer({
        perPage: props.perPage ?? 50,
        currentPage: props.currentPage ?? 1,
        rowCount: props.rowCount,
      })}
    >
      {props.children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  return useContext(PageContext);
}
