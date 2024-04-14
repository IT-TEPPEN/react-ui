"use client";

import { createContext, useContext } from "react";
import { TReturnUseFilterReducer } from "./types";
import { useFilterReducer } from "./hooks";

const FilterContext = createContext<TReturnUseFilterReducer>({
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
    <FilterContext.Provider value={useFilterReducer()}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  return useContext(FilterContext);
}
