"use client";

import { useTable } from "./hook";
import { TableCell } from "./cell";
import { Sort } from "./sort";
import { TableHeaderElement } from "./header";
import { DataObject, TPropsTable } from "./type";
import { Pagenation } from "./page";
import {
  TableFilter,
  TableFilterProvider,
  TableFilterRemoveButton,
} from "./filter";
import { useState } from "react";
import { TableFilterForm } from "./filter-form";

export default function Table<T extends DataObject>(props: TPropsTable<T>) {
  return (
    <TableFilterProvider>
      <BaseTable {...props} />
    </TableFilterProvider>
  );
}

function BaseTable<T extends DataObject>(props: TPropsTable<T>) {
  const {
    cols,
    rows,
    rowCount,
    sortKey,
    sortOrder,
    page: { count, current, from, to, next, prev, jump },
  } = useTable(props);
  const [isOpenFilterForm, setIsOpenFilterForm] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <TableFilterRemoveButton>remove all filter</TableFilterRemoveButton>
      </div>

      <div className="relative w-full h-full max-h-[80vh] border border-gray-200 rounded-md overflow-auto">
        <table className={`table table-auto w-full`}>
          <thead>
            <tr className="sticky top-0 border-gray-200 z-20">
              {cols.map((col) => (
                <TableHeaderElement
                  key={col.key}
                  label={col.label}
                  columnType={col.type}
                  sortConponent={
                    <Sort
                      onClick={col.onClick}
                      isSortedByThis={sortKey === col.key}
                      sortOrder={sortOrder}
                    />
                  }
                  filterComponent={
                    <TableFilter
                      keyName={col.key}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpenFilterForm((curr) => !curr);
                      }}
                    />
                  }
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {isOpenFilterForm && (
              <tr>
                <td
                  colSpan={cols.length}
                  className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl p-2 z-20"
                >
                  <div className="relative">
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpenFilterForm(false);
                        }}
                      >
                        close
                      </button>
                    </div>
                    <div>
                      <TableFilterForm cols={cols} />
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length} className="py-5">
                  <p className="text-center font-bold text-lg">NO DATA</p>
                </td>
              </tr>
            )}
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
                  <TableCell {...col} id={r.id}>
                    {r[col.key]}
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1">
        <p className="text-center text-sm text-gray-600">
          {from + 1} - {to < rowCount ? to : rowCount} of {rowCount}
        </p>
        <div className="mt-2">
          <Pagenation
            count={count}
            current={current}
            jump={jump}
            next={next}
            prev={prev}
          />
        </div>
      </div>
    </>
  );
}
