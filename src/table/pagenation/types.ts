import { usePageReducer } from "./hooks";

export type TPageState = {
  rowCount: number;
  /**
   * False until the row count is first known (more than 0 rows). Until then
   * a page given at the start (e.g. restored) is kept instead of resetting
   * to page 1.
   */
  synced?: boolean;
} & (
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
