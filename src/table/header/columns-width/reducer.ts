import { useMemo, useReducer, useRef, useLayoutEffect } from "react";
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
  const updateKeyRef = useRef<string | null>(null);

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
        updateKeyRef.current = key;
        dispatch({ type: "set", payload: { key, colWidth } });
      },
    }),
    []
  );

  useLayoutEffect(() => {
    if (updateKeyRef.current) {
      const key = updateKeyRef.current;

      const updateColWidth = () => {
        const colWidth = state[key].colWidth;
        const index = state[key].index;

        const className = `table-col-${index}`;
        const colElements = document.querySelectorAll(`.${className}`);
        colElements.forEach((colElement) => {
          colElement.setAttribute(
            "style",
            `width: ${colWidth}px; min-width: ${colWidth}px; max-width: ${colWidth}px;`
          );
        });
      };

      const timer = setTimeout(() => {
        updateColWidth();
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    } else {
      Object.keys(state).forEach((key) => {
        const colWidth = state[key].colWidth;
        const index = state[key].index;

        const className = `table-col-${index}`;
        const colElements = document.querySelectorAll(`.${className}`);
        colElements.forEach((colElement) => {
          colElement.setAttribute(
            "style",
            `width: ${colWidth}px; min-width: ${colWidth}px; max-width: ${colWidth}px;`
          );
        });
      });
    }
  }, [state]);

  return { state: stateActions, action };
};
