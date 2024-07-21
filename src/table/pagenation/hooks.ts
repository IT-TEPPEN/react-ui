import { useCallback, useMemo, useReducer } from "react";
import { TPageAction, TPageState } from "./types";
import { INITIAL_PAGE_STATE } from "./constants";
import { DataObject, DataRecord } from "../type";

function pagenationReducer(state: TPageState, action: TPageAction): TPageState {
  switch (action.type) {
    case "setRowCount":
      if (!state.enable) {
        return {
          ...state,
          rowCount: action.payload.rowCount,
        };
      }
      return {
        ...state,
        currentPage: 1,
        rowCount: action.payload.rowCount,
      };
    case "setPerPage":
      if (action.payload.perPage === "all") {
        return {
          rowCount: state.rowCount,
          enable: false,
        };
      }

      if (!state.enable) {
        return {
          rowCount: state.rowCount,
          enable: true,
          currentPage: 1,
          perPage: action.payload.perPage,
        };
      }

      return {
        ...state,
        currentPage: 1,
        perPage: action.payload.perPage,
      };
    case "next":
      if (!state.enable) {
        return state;
      }

      if (state.currentPage === Math.ceil(state.rowCount / state.perPage)) {
        return state;
      }

      return {
        ...state,
        currentPage: state.currentPage + 1,
      };
    case "prev":
      if (!state.enable) {
        return state;
      }

      if (state.currentPage === 1) {
        return state;
      }

      return {
        ...state,
        currentPage: state.currentPage - 1,
      };
    case "jump":
      if (!state.enable) {
        return state;
      }

      if (
        action.payload.pageNumber < 1 ||
        action.payload.pageNumber > Math.ceil(state.rowCount / state.perPage) ||
        state.currentPage === action.payload.pageNumber
      ) {
        return state;
      }

      return {
        ...state,
        currentPage: action.payload.pageNumber,
      };
    default:
      return state;
  }
}

export function usePageReducer(initialState?: TPageState) {
  const [state, dispatch] = useReducer(
    pagenationReducer,
    initialState ?? INITIAL_PAGE_STATE
  );

  const next = useCallback(() => dispatch({ type: "next" }), [dispatch]);
  const prev = useCallback(() => dispatch({ type: "prev" }), [dispatch]);
  const jump = useCallback(
    (pageNumber: number) => dispatch({ type: "jump", payload: { pageNumber } }),
    [dispatch]
  );

  const setRowCount = useCallback(
    (rowCount: number) =>
      dispatch({ type: "setRowCount", payload: { rowCount } }),
    [dispatch]
  );

  const from = useMemo(() => {
    if (!state.enable) {
      return 0;
    }
    return (state.currentPage - 1) * state.perPage;
  }, [state]);

  const to = useMemo(() => {
    if (!state.enable) {
      return state.rowCount;
    }
    return state.currentPage * state.perPage;
  }, [state]);

  const pageFilter = useCallback(
    <U extends DataRecord>(data: DataObject<U>[]): DataObject<U>[] => {
      return data.slice(from, to);
    },
    [from, to]
  );

  return {
    enable: state.enable,
    perPage: state.enable ? state.perPage : state.rowCount,
    current: state.enable ? state.currentPage : 1,
    rowCount: state.rowCount,
    pageCount: state.enable ? Math.ceil(state.rowCount / state.perPage) : 1,
    from,
    to,
    next,
    prev,
    jump,
    setRowCount,
    pageFilter,
  };
}
