import { memo, useCallback, useReducer } from "react";

type TPage = {
  perPage: number;
  currentPage: number;
  rowCount: number;
};

type TPageMoveAction =
  | { type: "setRowCount"; payload: { rouCount: number } }
  | { type: "setPerPage"; payload: { perPage: number } }
  | {
      type: "next";
    }
  | {
      type: "prev";
    }
  | {
      type: "jump";
      payload: { pageNumber: number };
    };

function pageReducer(state: TPage, action: TPageMoveAction): TPage {
  switch (action.type) {
    case "setRowCount":
      return {
        ...state,
        rowCount: action.payload.rouCount,
      };
    case "setPerPage":
      return {
        ...state,
        perPage: action.payload.perPage,
      };
    case "next":
      if (state.currentPage === Math.ceil(state.rowCount / state.perPage)) {
        return state;
      }

      return {
        ...state,
        currentPage: state.currentPage + 1,
      };
    case "prev":
      if (state.currentPage === 1) {
        return state;
      }

      return {
        ...state,
        currentPage: state.currentPage - 1,
      };
    case "jump":
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

const InitialPageState: TPage = {
  perPage: 50,
  currentPage: 1,
  rowCount: 0,
};

export function usePageReducer(initialState?: TPage) {
  const [state, dispatch] = useReducer(
    pageReducer,
    initialState ?? InitialPageState
  );

  const next = useCallback(() => dispatch({ type: "next" }), [dispatch]);
  const prev = useCallback(() => dispatch({ type: "prev" }), [dispatch]);
  const jump = useCallback(
    (pageNumber: number) => dispatch({ type: "jump", payload: { pageNumber } }),
    [dispatch]
  );

  return {
    perPage: state.perPage,
    currentPage: state.currentPage,
    rowCount: state.rowCount,
    pageCount: Math.ceil(state.rowCount / state.perPage),
    from: (state.currentPage - 1) * state.perPage,
    to: state.currentPage * state.perPage,
    next,
    prev,
    jump,
  };
}

type TPropsPagenation = {
  count: number;
  current: number;
  jump: (pageNumber: number) => void;
  next: () => void;
  prev: () => void;
};

export const Pagenation = memo(function TablePagenation(
  props: TPropsPagenation
) {
  return (
    <div className="flex justify-center gap-2">
      <button
        className="text-sm"
        onClick={() => props.jump(1)}
        disabled={props.current === 1}
      >
        &#x226A;
      </button>
      <button
        className="text-sm"
        onClick={() => props.prev()}
        disabled={props.current === 1}
      >
        &lt;
      </button>
      {Array.from({ length: props.count }, (_, i) => i + 1)
        .filter((i) => props.current - 2 <= i && i <= props.current + 2)
        .map((i) => (
          <button
            key={i}
            className={`text-sm ${props.current === i ? "text-blue-600" : ""}`}
            onClick={() => props.jump(i)}
          >
            {i}
          </button>
        ))}
      <button
        className="text-sm"
        onClick={() => props.next()}
        disabled={props.current === props.count}
      >
        &gt;
      </button>
      <button
        className="text-sm"
        onClick={() => props.jump(props.count)}
        disabled={props.current === props.count}
      >
        &#x226B;
      </button>
    </div>
  );
});
