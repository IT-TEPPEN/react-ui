import { useMemo, useReducer } from "react";
import { Target, TConditionInputHook } from "./type";
import { conditionInputReducer } from "./reducer";
import { DEFAULT_SEARCH_OPERATOR } from "../../../share/search-operator";

export const useConditionInputHook: TConditionInputHook = (target, options) => {
  const [state, dispatch] = useReducer(conditionInputReducer, {
    conditions: [],
    targets: target,
    operators: options?.operators ?? DEFAULT_SEARCH_OPERATOR,
    status: "waiting for input",
  });

  const actions = useMemo(
    () => ({
      inputTarget: (targetKey: string) => {
        dispatch({ type: "inputTarget", payload: { targetKey } });
      },
      inputOperator: (operatorKey: string) => {
        dispatch({ type: "inputOperator", payload: { operatorKey } });
      },
      inputValue: (value: string) => {
        dispatch({ type: "inputValue", payload: { value } });
      },
      deleteCondition: (index: number) => {
        dispatch({ type: "deleteCondition", payload: { index } });
      },
      reset: () => {
        dispatch({ type: "reset" });
      },
      updateTargets: (targets: Target[]) => {
        dispatch({ type: "updateTargets", payload: { targets } });
      },
      removeInputedTarget: () => {
        dispatch({ type: "removeInputedTarget" });
      },
      removeInputedOperator: () => {
        dispatch({ type: "removeInputedOperator" });
      },
    }),
    []
  );

  return {
    state,
    actions,
  };
};
