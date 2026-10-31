"use client";

import { createContext, useContext } from "react";
import { TPageContext, TPageState } from "./types";
import { usePageReducer } from "./hooks";

const PageContext = createContext<TPageContext>({
  enable: true,
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
  setPerPage: function (): void {
    throw new Error("Function not implemented.");
  },
  pageFilter: () => [],
});

export function PagenationProvider(props: {
  children: React.ReactNode;
  rowCount: number;
  perPage?: number | "all";
  currentPage?: number;
}) {
  // A rows-per-page count must be a positive whole number.
  const perPage =
    props.perPage === undefined ||
    props.perPage === "all" ||
    (Number.isInteger(props.perPage) && props.perPage > 0)
      ? props.perPage
      : (console.warn(
          `Ignored rowCountPerPage ${JSON.stringify(props.perPage)}; using 50`
        ),
        undefined);

  const pagenationParams: TPageState =
    perPage === "all"
      ? { enable: false, rowCount: props.rowCount }
      : {
          enable: true,
          rowCount: props.rowCount,
          perPage: perPage ?? 50,
          currentPage: props.currentPage ?? 1,
        };

  return (
    <PageContext.Provider value={usePageReducer(pagenationParams)}>
      {props.children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  return useContext(PageContext);
}
