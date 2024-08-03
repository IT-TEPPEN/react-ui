import { createContext, useContext, useMemo } from "react";
import {
  TTablePropertyActionContext,
  TTablePropertyStateContext,
} from "./type";
import { useTablePropertyReducer } from "./hook";

const TablePropertyStateContext = createContext<TTablePropertyStateContext>({
  maxDisplayColCount: 0,
  maxDisplayRowCount: 0,
});

const TablePropertyActionContext = createContext<TTablePropertyActionContext>({
  setMaxDisplayColCount: () => {},
  setMaxDisplayRowCount: () => {},
});

export function TablePropertyProvider(props: {
  children: JSX.Element | JSX.Element[];
}) {
  const tableProperty = useTablePropertyReducer();

  const state = useMemo(() => {
    return {
      maxDisplayColCount: tableProperty.maxDisplayColCount,
      maxDisplayRowCount: tableProperty.maxDisplayRowCount,
    };
  }, [tableProperty.maxDisplayColCount, tableProperty.maxDisplayRowCount]);

  const action = useMemo(() => {
    return {
      setMaxDisplayColCount: tableProperty.setMaxDisplayColCount,
      setMaxDisplayRowCount: tableProperty.setMaxDisplayRowCount,
    };
  }, []);

  return (
    <TablePropertyStateContext.Provider value={state}>
      <TablePropertyActionContext.Provider value={action}>
        {props.children}
      </TablePropertyActionContext.Provider>
    </TablePropertyStateContext.Provider>
  );
}

export function useTablePropertyStateContext() {
  return useContext(TablePropertyStateContext);
}

export function useTablePropertyActionContext() {
  return useContext(TablePropertyActionContext);
}

export function useTablePropertyContext() {
  return {
    ...useTablePropertyStateContext(),
    ...useTablePropertyActionContext(),
  };
}
