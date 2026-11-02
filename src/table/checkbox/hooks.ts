import { useReducer } from "react";
import { CheckboxStatusReducer } from "./types";
import { DataRecord } from "../table/type";

const checkboxReducer: CheckboxStatusReducer<DataRecord> = (state, action) => {
  switch (action.type) {
    case "SET":
      return { checkedRecords: action.payload.checkedRecords };
  }
};

export function useCheckboxStatusReducer() {
  const [checkboxStatusState, dispatchCheckboxStatus] = useReducer(
    checkboxReducer,
    { checkedRecords: [] }
  );

  return { checkboxStatusState, dispatchCheckboxStatus };
}
