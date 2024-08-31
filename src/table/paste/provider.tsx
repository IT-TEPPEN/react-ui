import { createContext, useContext } from "react";
import { TPasteReducerReturn } from "./types";
import { usePasteReducer } from "./hooks";

const PasteContext = createContext<TPasteReducerReturn>({
  setRows: () => {},
  setCols: () => {},
  setColValidators: () => {},
  setOnUpdateRowFunction: () => {},
  onPaste: () => {},
});

export function PasteProvider({
  children,
  rows,
  cols,
  colValidators,
  onUpdateRowFunction = () => {},
}: {
  children: JSX.Element | JSX.Element[];
  rows: any[];
  cols: any[];
  colValidators: { [key: string]: (value: any) => boolean };
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
}) {
  return (
    <PasteContext.Provider
      value={usePasteReducer({
        rows,
        cols,
        colValidators,
        onUpdateRowFunction,
      })}
    >
      {children}
    </PasteContext.Provider>
  );
}

export function usePasteActionContext() {
  return useContext(PasteContext);
}
