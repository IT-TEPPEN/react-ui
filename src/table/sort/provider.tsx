"use client";

import { createContext, useContext } from "react";
import { TReturnSortReducer } from "./types";
import { useSortReducer } from "./hooks";
import { DataRecord } from "../type";

const SortContext = createContext<TReturnSortReducer<DataRecord>>({
  key: "",
  asc: false,
  changeKey: function (): void {
    throw new Error("Function not implemented.");
  },
  changeOrder: function (): void {
    throw new Error("Function not implemented.");
  },
  sort: () => [],
});

export function SortProvider(props: {
  children: React.ReactNode;
  initialCondition?: { key: string; asc?: boolean };
}) {
  return (
    <SortContext.Provider value={useSortReducer(props.initialCondition)}>
      {props.children}
    </SortContext.Provider>
  );
}

export function useSortContext() {
  return useContext(SortContext);
}
