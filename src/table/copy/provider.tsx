import { createContext, useContext } from "react";
import { TCopyActionContext, TCopyStateContext } from "./types";
import { useCopyReducer } from "./hooks";

const CopyStateContext = createContext<TCopyStateContext>({
  copiedAt: new Date(),
});

const CopyActionContext = createContext<TCopyActionContext>({
  copy: () => {},
  setRows: () => {},
});

export function CopyProvider({
  children,
  rows,
  cols,
}: {
  children: JSX.Element | JSX.Element[];
  rows: any[];
  cols: any[];
}) {
  const { states, actions } = useCopyReducer({
    rows,
    cols,
  });
  return (
    <CopyStateContext.Provider value={states}>
      <CopyActionContext.Provider value={actions}>
        {children}
      </CopyActionContext.Provider>
    </CopyStateContext.Provider>
  );
}

export function useCopyStateContext() {
  return useContext(CopyStateContext);
}

export function useCopyActionContext() {
  return useContext(CopyActionContext);
}
