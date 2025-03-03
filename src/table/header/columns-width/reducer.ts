import { useMemo, useReducer } from "react";
import { TColumnsWidthHook, TColumnsWidthReducer } from "./type";
import { DEFAULT_COL_WIDTH, DEFAULT_MIN_COL_WIDTH } from "../../constant";

export const columnsWidthReducer: TColumnsWidthReducer = (state, action) => {
  switch (action.type) {
    case "init":
      return action.payload.columnsWidth;
    case "setMinWidth":
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          minWidth: action.payload.minWidth,
        },
      };
    case "set":
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key],
          colWidth: action.payload.colWidth,
        },
      };
    default:
      return state;
  }
};

export const useColumnsWidthReducer: TColumnsWidthHook = (initialState) => {
  const [state, dispatch] = useReducer(columnsWidthReducer, initialState);

  const stateActions = useMemo(
    () => ({
      getColumnWidth: (key: string) => {
        const s = state[key];

        if (!s) {
          console.warn(`Column width state not found: ${key}`);
          return DEFAULT_COL_WIDTH;
        }

        return s.colWidth;
      },
      getColumnMinWidth: (key: string) => {
        const s = state[key];

        if (!s) {
          console.warn(`Column width state not found: ${key}`);
          return DEFAULT_MIN_COL_WIDTH;
        }

        return s.minWidth;
      },
    }),
    [state]
  );

  const action = useMemo(
    () => ({
      setColWidth: (key: string, colWidth: number) => {
        dispatch({ type: "set", payload: { key, colWidth } });
      },
    }),
    []
  );

  return { state: stateActions, action };
};
