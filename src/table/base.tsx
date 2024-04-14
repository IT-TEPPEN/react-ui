"use client";

import { useState } from "react";
import { useTable } from "./hook";
import { TableCell } from "./cell";
import { TableHeaderElement } from "./header";
import { TPropsTable } from "./type";
import { PagenationProvider, DisplayRange, Pagenation } from "./pagenation";
import {
  FilterProvider,
  TableFilter,
  TableFilterForm,
  TableFilterRemoveButton,
} from "./filter";
import { SortButton, SortProvider } from "./sort";
import { RowProvider } from "./sheet/providers";

export default function Table(props: TPropsTable) {
  return (
    <FilterProvider>
      <SortProvider initialCondition={props.initialCondition?.sort}>
        <PagenationProvider rowCount={props.rows.length}>
          <BaseTable {...props} />
        </PagenationProvider>
      </SortProvider>
    </FilterProvider>
  );
}

function BaseTable(props: TPropsTable) {
  const { cols, rows } = useTable(props);
  const [isOpenFilterForm, setIsOpenFilterForm] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <TableFilterRemoveButton>remove all filters</TableFilterRemoveButton>
      </div>

      <div className="relative w-full h-full max-h-[80vh] border border-gray-200 rounded-md overflow-auto">
        <table className={`table table-auto w-full`}>
          <thead>
            <tr className="sticky top-0 border-gray-200 z-20">
              {cols.map((col) => (
                <TableHeaderElement
                  key={col.key}
                  label={col.label}
                  sortConponent={
                    col.type !== "component" ? (
                      <SortButton keyName={col.key} />
                    ) : undefined
                  }
                  filterComponent={
                    col.type !== "component" ? (
                      <TableFilter
                        keyName={col.key}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpenFilterForm((curr) => !curr);
                        }}
                      />
                    ) : undefined
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
                  className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl py-5 px-2 z-20"
                >
                  <div className="container max-w-[768px] mx-auto">
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
              <RowProvider key={r.id} row={r}>
                <tr
                  className={`border border-gray-200 hover:bg-gray-100 ${
                    !!rows[0]?.onClick ? "hover:cursor-pointer" : ""
                  }`}
                  onClick={r.onClick}
                  data-testid={r.id}
                >
                  {cols.map((col) => {
                    const { key, ...colInfo } = col;
                    return (
                      <TableCell key={key} {...colInfo} columnKey={col?.key}>
                        {r[col?.key]}
                      </TableCell>
                    );
                  })}
                </tr>
              </RowProvider>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1">
        <DisplayRange />
        <div className="mt-2">
          <Pagenation />
        </div>
      </div>
    </div>
  );
}
