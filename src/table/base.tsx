"use client";

import { useEffect } from "react";
import { useTable } from "./hook";
import { TableCell } from "./cell";
import { TableHeaderElement } from "./header";
import { DataRecord, TPropsTable } from "./type";
import { PagenationProvider, DisplayRange, Pagenation } from "./pagenation";
import {
  FilterProvider,
  TableFilterForm,
  TableFilterRemoveButton,
  useFilterContext,
} from "./filter";
import { SortProvider } from "./sort";
import { CellProvider, ColumnsProvider, RowProvider } from "./sheet/providers";
import { FocusProvider, useFocusContext } from "./edit/provider";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
  return (
    <FilterProvider>
      <SortProvider initialCondition={props.initialCondition?.sort}>
        <PagenationProvider rowCount={props.rows.length}>
          <ColumnsProvider cols={props.cols}>
            <FocusProvider columnCount={props.cols.length}>
              <BaseTable {...props} />
            </FocusProvider>
          </ColumnsProvider>
        </PagenationProvider>
      </SortProvider>
    </FilterProvider>
  );
}

function BaseTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { cols, rows } = useTable<T>(props);
  const {
    isFocus,
    isEditing,
    edit,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    unfocus,
    setMaxRowNumber,
  } = useFocusContext();
  const { selectedFilterKey } = useFilterContext();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!isFocus || isEditing) return;

      if (e.key === "Enter") {
        e.preventDefault();
        moveDown();
      } else if (e.key === "Escape") {
        e.preventDefault();
        unfocus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveRight();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveLeft();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveDown();
      } else if (e.key === "F2") {
        edit();
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [isEditing, isFocus]);

  useEffect(() => {
    setMaxRowNumber(rows.length - 1);
  }, [rows.length]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-1 mr-3">
        <TableFilterRemoveButton>
          <p className="text-xs underline text-gray-500 hover:text-gray-700">
            全てのフィルタリング条件を解除する
          </p>
        </TableFilterRemoveButton>
      </div>

      <div
        id="table-frame"
        className="relative w-full h-full max-h-[80vh] border border-gray-200 rounded-md overflow-auto"
      >
        <table className={`table table-auto w-full`}>
          <thead>
            <tr className="sticky top-0 border-gray-200 z-20">
              {cols.map((col) => (
                <TableHeaderElement
                  key={col.key as string}
                  columnKey={col.key as string}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {!!selectedFilterKey && (
              <tr>
                <td
                  colSpan={cols.length}
                  className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl z-20 p-0 overflow-hidden"
                >
                  <TableFilterForm />
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
            {rows.map((r, i) => (
              <RowProvider key={r.id} row={r}>
                <tr
                  className={`relative border border-gray-200 after:absolute after:w-full after:h-full after:top-0 after:left-0 after:pointer-events-none after:hover:bg-gray-500/10 ${
                    !!props.onClickRow ? "hover:cursor-pointer" : ""
                  } ${
                    props.applyRowFormatting ? props.applyRowFormatting(r) : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!!props.onClickRow) props.onClickRow(r);
                  }}
                  data-testid={r.id}
                >
                  {cols.map((col, j) => {
                    return (
                      <CellProvider
                        key={col.key as string}
                        columnKey={col.key as string}
                        rowIndex={i}
                        colIndex={j}
                      >
                        <TableCell />
                      </CellProvider>
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
