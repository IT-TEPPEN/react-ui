import { useMemo, useReducer } from "react";
import { TFilterHook } from "./type";
import { filterReducer } from "./reducer";
import { Condition } from "../../search-bar";
import { DataObject, DataRecord } from "../table/type";

export const useFilterHook: TFilterHook = (initialConditions) => {
  const [state, dispatch] = useReducer(filterReducer, {
    conditions: initialConditions,
  });

  const actions = useMemo(
    () => ({
      addFilter: (condition: Condition) => {
        dispatch({ type: "add", payload: { condition } });
      },
      removeFilter: (index: number) => {
        dispatch({ type: "remove", payload: { index } });
      },
      clearFilter: () => {
        dispatch({ type: "clear" });
      },
    }),
    [state.conditions]
  );

  const functions = useMemo(
    () => ({
      filter: <T extends DataRecord>(rows: DataObject<T>[]) => {
        return rows.filter((row) => {
          return state.conditions.every((condition) => {
            const value = row[condition.target.key];
            return isMatchCondition(condition, value, condition.value);
          });
        });
      },
    }),
    [state.conditions]
  );

  return {
    state,
    actions,
    functions,
  };
};

function isMatchCondition(
  condition: Condition,
  targetValue: any,
  value: any
): boolean {
  switch (condition.operator.type) {
    // case "date":
    //   switch (condition.operator.key) {
    //     case "date:eq":
    //       return false;
    //     case "date:gt":
    //       return false;
    //     case "date:gte":
    //       return false;
    //     case "date:lt":
    //       return false;
    //     case "date:lte":
    //       return false;
    //     case "date:neq":
    //       return false;
    //     case "date:is_not_null":
    //       return false;
    //     case "date:is_null":
    //       return false;
    //   }
    case "number":
      const numValue = Number(value);

      switch (condition.operator.key) {
        case "number:eq":
          return targetValue === numValue;
        case "number:gt":
          return targetValue > numValue;
        case "number:gte":
          return targetValue >= numValue;
        case "number:lt":
          return targetValue < numValue;
        case "number:lte":
          return targetValue <= numValue;
        case "number:neq":
          return targetValue !== numValue;
      }
    case "string":
      switch (condition.operator.key) {
        case "string:eq":
          return targetValue === value;
        case "string:like":
          return targetValue.includes(value);
        case "string:in":
          return value.includes(targetValue);
        case "string:is_not_null":
          return targetValue !== null && targetValue !== undefined;
        case "string:is_null":
          return targetValue === null || targetValue === undefined;
        case "string:neq":
          return targetValue !== value;
        case "string:not_in":
          return !value.includes(targetValue);
        case "string:not_like":
          return !targetValue.includes(value);
      }
  }
}
