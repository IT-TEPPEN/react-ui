"use client";

import { createContext, useContext, useState } from "react";
import { TReturnUseFilterReducer } from "./types";
import { useFilterReducer } from "./hooks";
import { FilteringColumnProvider } from "./hooks/selectedFilteringColumn/provider";

const FilterContext = createContext<
  TReturnUseFilterReducer<{ [key: string]: string | number }>
>({
  addFilter: () => {},
  removeFilter: () => {},
  clearFilter: () => {},
  filter: () => [],
  filterConditions: [],
});

export function FilterProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <FilteringColumnProvider>
      <FilterContext.Provider value={useFilterReducer()}>
        {children}
      </FilterContext.Provider>
    </FilteringColumnProvider>
  );
}

export function useFilterContext() {
  return { ...useContext(FilterContext) };
}
