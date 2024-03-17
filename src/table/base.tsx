"use client";

import { useTable } from "./hook";
import { TableCell } from "./cell";
import { Sort } from "./sort";
import { TableHeaderElement } from "./header";
import { DataObject, TPropsTable } from "./type";

export default function Table<T extends DataObject>(props: TPropsTable<T>) {
  const { cols, rows, sortKey, sortOrder } = useTable(props);

  return (
    <div className="relative w-full h-full max-h-[90vh] border border-gray-200 rounded-md overflow-auto">
      <table className={`table table-auto w-full`}>
        <thead>
          <tr className="sticky top-0 border-gray-200">
            {cols.map((col) => (
              <TableHeaderElement
                key={col.key}
                label={col.label}
                sortConponent={
                  <Sort
                    onClick={col.onClick}
                    isSortedByThis={sortKey === col.key}
                    sortOrder={sortOrder}
                  />
                }
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={`border border-gray-200 hover:bg-gray-100 ${
                !!rows[0]?.onClick ? "hover:cursor-pointer" : ""
              }`}
              onClick={r.onClick}
              data-testid={r.id}
            >
              {cols.map((col) => (
                <td key={col.key}>
                  <TableCell key={col.key}>{r[col.key]}</TableCell>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
