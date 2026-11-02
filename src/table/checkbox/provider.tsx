import { createContext, useContext } from "react";
import { DataRecord, TCheckboxProperty } from "../table/type";
import { useCheckboxStatusReducer } from "./hooks";

const CheckboxStatusContext = createContext<
  ReturnType<typeof useCheckboxStatusReducer>
>({
  checkboxStatusState: {
    checkedRecords: [],
  },
  dispatchCheckboxStatus: () => {},
});

export function CheckboxStatusProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  return (
    <CheckboxStatusContext.Provider
      value={useCheckboxStatusReducer()}
    >
      {children}
    </CheckboxStatusContext.Provider>
  );
}

export function useCheckboxStatusContext() {
  return useContext(CheckboxStatusContext);
}

const CheckboxContext =
  createContext<TCheckboxProperty<DataRecord>["checkbox"]>(undefined);

export function CheckboxProvider({
  children,
  checkbox,
}: {
  children: React.ReactNode;
  checkbox: TCheckboxProperty<DataRecord>["checkbox"];
}) {
  return (
    <CheckboxContext.Provider value={checkbox}>
      {children}
    </CheckboxContext.Provider>
  );
}

export function useCheckboxContext() {
  return useContext(CheckboxContext);
}
