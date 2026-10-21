import { createContext, useContext } from "react";
import { TPasteHookArguments, TPasteReducerReturn } from "./types";
import { usePasteReducer } from "./hooks";

const PasteContext = createContext<TPasteReducerReturn>({
  setRows: () => {},
  onPaste: () => {},
});

export function PasteProvider({
  children,
  ...args
}: TPasteHookArguments & {
  children: React.JSX.Element | React.JSX.Element[];
}) {
  return (
    <PasteContext.Provider value={usePasteReducer(args)}>
      {children}
    </PasteContext.Provider>
  );
}

export function usePasteActionContext() {
  return useContext(PasteContext);
}
