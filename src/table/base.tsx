"use client";

import { useState } from "react";
import { tv } from "tailwind-variants";

type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

type TPropsTable<T extends DataObject> = {
  cols: { key: string; label?: string }[];
  rows: T[];
};

const tvTableDesign = tv({
  slots: {
    frame: "table table-auto w-full",
    header: "bg-gray-200 text-gray-600",
    row: "hover:bg-gray-100",
    cell: "p-2 w-fit text-left cursor-default",
  },
  variants: {
    hover: {
      true: {
        row: "hover:cursor-pointer",
      },
    },
  },
});

type State = {
  key: string;
  order: "ASC" | "DESC";
};

function useTable<T extends DataObject>(props: TPropsTable<T>) {
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
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
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

export default function Table<T extends DataObject>(props: TPropsTable<T>) {
  const { cols, rows, sortKey, sortOrder } = useTable(props);
  const { frame, cell, row, header } = tvTableDesign({
    hover: !!rows[0]?.onClick,
  });
  return (
    <table className={frame()}>
      <thead className={header()}>
        <tr>
          {cols.map((col) => (
            <th key={col.key} className={cell()}>
              {col.label}
              <button onClick={col.onClick}>
                {sortKey === col.key ? (sortOrder === "ASC" ? "▲" : "▼") : "△"}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className={row()}
            onClick={r.onClick}
            data-testid={r.id}
          >
            {cols.map((col) => (
              <td key={col.key}>
                <div
                  className={cell()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {r[col.key]}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
