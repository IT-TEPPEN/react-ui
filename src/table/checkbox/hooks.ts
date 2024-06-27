import { useReducer } from "react";
import { CheckboxStatusReducer } from "./types";
import { DataRecord } from "../type";

const checkboxReducer: CheckboxStatusReducer<DataRecord> = (state, action) => {
  switch (action.type) {
    case "SET":
      return { checkedRecords: action.payload.checkedRecords };
  }
};

export function useCheckboxStatusReducer(checkboxCount: number) {
  const [checkboxStatusState, dispatchCheckboxStatus] = useReducer(
    checkboxReducer,
    { checkedRecords: [] }
  );

  return {
    checkboxStatusState,
    dispatchCheckboxStatus,
    allUnchecked: checkboxStatusState.checkedRecords.length === 0,
    existChecked: checkboxStatusState.checkedRecords.length > 0,
    indeterminate:
      checkboxStatusState.checkedRecords.length > 0 &&
      checkboxStatusState.checkedRecords.length < checkboxCount,
  };
}
