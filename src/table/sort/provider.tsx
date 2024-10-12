"use client";

import { createContext, useContext } from "react";
import { TReturnSortReducer } from "./types";
import { useSortReducer } from "./hooks";
import { DataRecord } from "../table/type";

const SortTimingContext = createContext<number>(0);

const SortStateContext = createContext<TReturnSortReducer<DataRecord>["state"]>(
  {
    key: "",
    asc: false,
    isUpdatedData: false,
  }
);

const SortActionContext = createContext<
  TReturnSortReducer<DataRecord>["actions"]
>({
  changeKey: function (): void {
    throw new Error("Function not implemented.");
  },
  changeOrder: function (): void {
    throw new Error("Function not implemented.");
  },
  sort: () => [],
  updatedData: function (): void {
    throw new Error("Function not implemented.");
  },
});

export function SortProvider(props: {
  children: React.ReactNode;
  initialCondition?: { key: string; asc?: boolean };
}) {
  const { state, actions, sortTiming } = useSortReducer(props.initialCondition);
  return (
    <SortTimingContext.Provider value={sortTiming}>
      <SortStateContext.Provider value={state}>
        <SortActionContext.Provider value={actions}>
          {props.children}
        </SortActionContext.Provider>
      </SortStateContext.Provider>
    </SortTimingContext.Provider>
  );
}

export function useSortContext() {
  return {
    ...useContext(SortStateContext),
    ...useContext(SortActionContext),
    sortTiming: useContext(SortTimingContext),
  };
}

export function useSortStateContext() {
  return useContext(SortStateContext);
}

export function useSortActionContext() {
  return useContext(SortActionContext);
}

export function useSortTimingContext() {
  return useContext(SortTimingContext);
}
