import { useMemo, useReducer } from "react";
import { SearchInput, Target, TConditionInputHook } from "./type";
import { conditionInputReducer } from "./reducer";

export const useConditionInputHook: TConditionInputHook = (
  targets,
  onChangeCondition
) => {
  const [state, dispatch] = useReducer(conditionInputReducer, {
    targets,
    onChangeCondition,
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
      inputValue: (value: SearchInput) => {
        dispatch({ type: "inputValue", payload: value });
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
