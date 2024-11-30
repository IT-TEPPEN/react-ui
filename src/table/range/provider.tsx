import { createContext, useContext } from "react";
import { TRangeActionContext, TRangeStateContext } from "./type";
import { NoImplementeFunction } from "../lib/errors";
import { useRangeReducer } from "./hooks";

const RangeStateContext = createContext<TRangeStateContext>({
  constraint: {
    maxRowIndex: 0,
    maxColIndex: 0,
  },
  isSelecting: false,
});

const RangeActionContext = createContext<TRangeActionContext>({
  start: NoImplementeFunction,
  end: NoImplementeFunction,
  moveUp: NoImplementeFunction,
  moveDown: NoImplementeFunction,
  moveLeft: NoImplementeFunction,
  moveRight: NoImplementeFunction,
  extendUp: NoImplementeFunction,
  extendDown: NoImplementeFunction,
  extendLeft: NoImplementeFunction,
  extendRight: NoImplementeFunction,
  reset: NoImplementeFunction,
});

export function RangeProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { state, actions } = useRangeReducer();

  return (
    <RangeStateContext.Provider value={state}>
      <RangeActionContext.Provider value={actions}>
        {children}
      </RangeActionContext.Provider>
    </RangeStateContext.Provider>
  );
}

export function useRangeStateContext() {
  return useContext(RangeStateContext);
}

export function useRangeActionContext() {
  return useContext(RangeActionContext);
}
