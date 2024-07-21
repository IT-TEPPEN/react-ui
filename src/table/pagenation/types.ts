import { usePageReducer } from "./hooks";

export type TPageState = { rowCount: number } & (
  | {
      enable: false;
    }
  | {
      enable: true;
      perPage: number;
      currentPage: number;
    }
);

export type TPageAction =
  | { type: "setRowCount"; payload: { rowCount: number } }
  | { type: "setPerPage"; payload: { perPage: number | "all" } }
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
