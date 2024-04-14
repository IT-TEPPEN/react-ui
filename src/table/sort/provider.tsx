"use client";

import { createContext, useContext } from "react";
import { TReturnSortReducer } from "./types";
import { DataObject } from "../type";
import { useSortReducer } from "./hooks";

const SortContext = createContext<TReturnSortReducer>({
  key: "",
  asc: false,
  changeKey: function (): void {
    throw new Error("Function not implemented.");
  },
  changeOrder: function (): void {
    throw new Error("Function not implemented.");
  },
  sort: function (): DataObject[] {
    throw new Error("Function not implemented.");
  },
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
