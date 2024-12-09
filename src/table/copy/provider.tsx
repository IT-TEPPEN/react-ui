import { createContext, useContext } from "react";
import { TCopyActionContext } from "./types";
import { useCopyReducer } from "./hooks";

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
  return (
    <CopyActionContext.Provider
      value={
        useCopyReducer({
          rows,
          cols,
        }).actions
      }
    >
      {children}
    </CopyActionContext.Provider>
  );
}

export function useCopyActionContext() {
  return useContext(CopyActionContext);
}
