import { createContext, useContext } from "react";
import {
  TFilteringColumnActionContext,
  TFilteringColumnStateContext,
} from "./type";
import { useFilteringColumnReducer } from "./hooks";

const FilteringColumnStateContext =
  createContext<TFilteringColumnStateContext>(null);

const FilteringColumnActionContext =
  createContext<TFilteringColumnActionContext>({
    setFilteringColumn: () => {},
    clearFilteringColumn: () => {},
  });

type TPropsFilteringColumnProvider = {
  children: JSX.Element | JSX.Element[];
};

export function FilteringColumnProvider(props: TPropsFilteringColumnProvider) {
  const { state, actions } = useFilteringColumnReducer();
  return (
    <FilteringColumnStateContext.Provider value={state}>
      <FilteringColumnActionContext.Provider value={actions}>
        {props.children}
      </FilteringColumnActionContext.Provider>
    </FilteringColumnStateContext.Provider>
  );
}

export function useFilteringColumnStateContext() {
  return useContext(FilteringColumnStateContext);
}

export function useFilteringColumnActionContext() {
  return useContext(FilteringColumnActionContext);
}

export function useFilteringColumnContext() {
  return {
    ...useFilteringColumnStateContext(),
    ...useFilteringColumnActionContext(),
  };
}
