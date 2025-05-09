import { useMemo, useReducer } from "react";
import { TFilterHook } from "./type";
import { filterReducer } from "./reducer";
import { Condition } from "../../search-bar";
import { DataObject, DataRecord } from "../table/type";
import { SearchInput } from "../../search-bar/condition-search-bar/condition-input-management/type";

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
            return isMatchCondition(condition, value, condition.input);
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
  input: SearchInput
): boolean {
  switch (condition.operator.type) {
    case "number":
      switch (condition.operator.inputType) {
        case "single number":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          const numValue = input.payload.value;

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
      }

    case "string":
      switch (condition.operator.inputType) {
        case "none":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          switch (condition.operator.key) {
            case "string:is_not_null":
              return (
                targetValue !== null &&
                targetValue !== undefined &&
                targetValue !== ""
              );
            case "string:is_null":
              return (
                targetValue === null ||
                targetValue === undefined ||
                targetValue === ""
              );
          }
        case "single string":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          const value = input.payload.value;

          switch (condition.operator.key) {
            case "string:eq":
              return targetValue === value;
            case "string:like":
              return targetValue.includes(value);
            case "string:neq":
              return targetValue !== value;
            case "string:not_like":
              return !targetValue.includes(value);
          }
      }

    case "select":
      switch (condition.operator.inputType) {
        case "select":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          const value = input.payload.value;

          switch (condition.operator.key) {
            case "select:eq":
              return targetValue === value;
            case "select:neq":
              return targetValue !== value;
          }
        case "none":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          switch (condition.operator.key) {
            case "select:is_null":
              return (
                targetValue === null ||
                targetValue === undefined ||
                targetValue === ""
              );
            case "select:is_not_null":
              return (
                targetValue !== null &&
                targetValue !== undefined &&
                targetValue !== ""
              );
          }
      }
    case "date":
      switch (condition.operator.inputType) {
        case "single date":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          const dateValue = input.payload.value;

          if (!(targetValue instanceof Date)) {
            throw new Error("date value is not Date object");
          }

          switch (condition.operator.key) {
            case "date:eq":
              return (
                targetValue.getFullYear() === dateValue.getFullYear() &&
                targetValue.getMonth() === dateValue.getMonth() &&
                targetValue.getDate() === dateValue.getDate()
              );
            case "date:neq":
              return (
                targetValue.getFullYear() !== dateValue.getFullYear() ||
                targetValue.getMonth() !== dateValue.getMonth() ||
                targetValue.getDate() !== dateValue.getDate()
              );
            case "date:gt":
              return targetValue > dateValue;
            case "date:gte":
              return targetValue >= dateValue;
            case "date:lt":
              return targetValue < dateValue;
            case "date:lte":
              return targetValue <= dateValue;
          }
        case "none":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          switch (condition.operator.key) {
            case "date:is_null":
              return (
                targetValue === null ||
                targetValue === undefined ||
                targetValue === ""
              );
            case "date:is_not_null":
              return (
                targetValue !== null &&
                targetValue !== undefined &&
                targetValue !== ""
              );
          }
      }
    case "datetime":
      switch (condition.operator.inputType) {
        case "single datetime":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          const dateValue = input.payload.value;

          switch (condition.operator.key) {
            case "datetime:gt":
              return targetValue > dateValue;
            case "datetime:gte":
              return targetValue >= dateValue;
            case "datetime:lt":
              return targetValue < dateValue;
            case "datetime:lte":
              return targetValue <= dateValue;
          }
        case "none":
          if (input.type !== condition.operator.inputType) {
            throw new Error("input type is not match");
          }

          switch (condition.operator.key) {
            case "datetime:is_null":
              return (
                targetValue === null ||
                targetValue === undefined ||
                targetValue === ""
              );
            case "datetime:is_not_null":
              return (
                targetValue !== null &&
                targetValue !== undefined &&
                targetValue !== ""
              );
          }
      }
  }
}
