import { usePageReducer } from "./hooks";

export type TPageState = {
  perPage: number;
  currentPage: number;
  rowCount: number;
};

export type TPageAction =
  | { type: "setRowCount"; payload: { rowCount: number } }
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

export type TPageContext = ReturnType<typeof usePageReducer>;
