import { createContext, useContext } from "react";
import { TCheckboxProperty } from "../type";
import { useCheckboxStatusReducer } from "./hooks";

const CheckboxStatusContext = createContext<
  ReturnType<typeof useCheckboxStatusReducer>
>({
  checkboxStatusState: {
    checkedRecords: [],
  },
  dispatchCheckboxStatus: () => {},
  allUnchecked: false,
  existChecked: false,
  indeterminate: false,
});

export function CheckboxStatusProvider({
  children,
  checkboxCount,
}: {
  children: JSX.Element;
  checkboxCount: number;
}) {
  return (
    <CheckboxStatusContext.Provider
      value={useCheckboxStatusReducer(checkboxCount)}
    >
      {children}
    </CheckboxStatusContext.Provider>
  );
}

export function useCheckboxStatusContext() {
  return useContext(CheckboxStatusContext);
}

const CheckboxContext =
  createContext<TCheckboxProperty<any>["checkbox"]>(undefined);

export function CheckboxProvider({
  children,
  checkbox,
}: {
  children: React.ReactNode;
  checkbox: TCheckboxProperty<any>["checkbox"];
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
