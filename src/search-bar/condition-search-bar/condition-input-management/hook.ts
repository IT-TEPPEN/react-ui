import { useEffect, useMemo, useReducer } from "react";
import { Condition, Target, TConditionInputHook } from "./type";
import { conditionInputReducer } from "./reducer";

export const useConditionInputHook: TConditionInputHook = (
  targets,
  onChangeCondition
) => {
  const [state, dispatch] = useReducer(conditionInputReducer, {
    targets,
    status: "waiting for input",
  });

  useEffect(() => {
    if (state.changeAction) {
      onChangeCondition(state.changeAction);
      dispatch({ type: "executedChangeAction" });
    }
  }, [state.changeAction]);

  useEffect(() => {
    if (targets && targets.length > 0) {
      dispatch({ type: "updateTargets", payload: { targets } });
    }
  }, [targets]);

  const actions = useMemo(
    () => ({
      inputTarget: (targetKey: string) => {
        dispatch({ type: "inputTarget", payload: { targetKey } });
      },
      editCondition: (index: number, condition: Condition) => {
        dispatch({ type: "editCondition", payload: { index, condition } });
      },
      applyCondition: (condition: Condition) => {
        dispatch({ type: "applyCondition", payload: { condition } });
      },
      deleteCondition: (index: number) => {
        dispatch({ type: "deleteCondition", payload: { index } });
      },
      clearConditions: () => {
        dispatch({ type: "clearConditions" });
      },
      reset: () => {
        dispatch({ type: "reset" });
      },
      updateTargets: (targets: Target[]) => {
        dispatch({ type: "updateTargets", payload: { targets } });
      },
    }),
    []
  );

  return {
    state,
    actions,
  };
};
