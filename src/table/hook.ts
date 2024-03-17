import { useMemo, useState } from "react";
import { DataObject, TPropsTable } from "./type";
import { usePageReducer } from "./page";

type State = {
  key: string;
  order: "ASC" | "DESC";
};

export function useTable<T extends DataObject>(props: TPropsTable<T>) {
  const [key, changeKey] = useState<State>({ key: "id", order: "ASC" });
  const { currentPage, pageCount, from, to, next, prev, jump } = usePageReducer(
    {
      perPage: 50,
      currentPage: 1,
      rowCount: props.rows.length,
    }
  );

  const { cols, rows } = props;

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a[key.key] < b[key.key]) {
          return key.order === "ASC" ? -1 : 1;
        }
        if (a[key.key] > b[key.key]) {
          return key.order === "ASC" ? 1 : -1;
        }
        return 0;
      }),
    [rows, key.key, key.order]
  );

  const pagedRows = useMemo(
    () => sortedRows.slice(from, to),
    [from, to, sortedRows]
  );

  const colsWithSort = cols.map((col) => ({
    ...col,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (key.key === col.key) {
        changeKey({
          key: col.key,
          order: key.order === "ASC" ? "DESC" : "ASC",
        });
      } else {
        changeKey({ key: col.key, order: "ASC" });
      }
    },
  }));

  return {
    cols: colsWithSort,
    rows: pagedRows,
    sortKey: key.key,
    sortOrder: key.order,
    page: {
      from,
      to,
      count: pageCount,
      current: currentPage,
      next,
      prev,
      jump,
    },
  };
}
