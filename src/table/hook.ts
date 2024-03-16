import { useState } from "react";
import { DataObject, TPropsTable } from "./type";

type State = {
  key: string;
  order: "ASC" | "DESC";
};

export function useTable<T extends DataObject>(props: TPropsTable<T>) {
  const [key, changeKey] = useState<State>({ key: "id", order: "ASC" });
  const { cols, rows } = props;

  const sortedRows = [...rows].sort((a, b) => {
    if (a[key.key] < b[key.key]) {
      return key.order === "ASC" ? -1 : 1;
    }
    if (a[key.key] > b[key.key]) {
      return key.order === "ASC" ? 1 : -1;
    }
    return 0;
  });

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
    rows: sortedRows,
    sortKey: key.key,
    sortOrder: key.order,
  };
}
