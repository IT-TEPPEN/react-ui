import { createContext, useContext, useMemo } from "react";
import { TTablePropertyActionContext, TTablePropertyState } from "./type";
import { useTablePropertyReducer } from "./hook";

const TablePropertyStateContext = createContext<TTablePropertyState>({
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
  const { state, setMaxDisplayColCount, setMaxDisplayRowCount } =
    useTablePropertyReducer();

  const action = useMemo(() => {
    return {
      setMaxDisplayColCount: setMaxDisplayColCount,
      setMaxDisplayRowCount: setMaxDisplayRowCount,
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
