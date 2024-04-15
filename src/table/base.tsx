"use client";

import { useEffect, useState } from "react";
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
import { CellProvider, ColumnsProvider, RowProvider } from "./sheet/providers";
import { FocusProvider, useFocusContext } from "./edit/provider";

export default function Table(props: TPropsTable) {
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

function BaseTable(props: TPropsTable) {
  const { cols, rows } = useTable(props);
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
  const [isOpenFilterForm, setIsOpenFilterForm] = useState(false);

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
      } else {
        console.log(e.key);
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
            {rows.map((r, i) => (
              <RowProvider key={r.id} row={r}>
                <tr
                  className={`border border-gray-200 hover:bg-gray-100 ${
                    !!rows[0]?.onClick ? "hover:cursor-pointer" : ""
                  }`}
                  onClick={r.onClick}
                  data-testid={r.id}
                >
                  {cols.map((col, j) => {
                    return (
                      <CellProvider key={col.key} rowIndex={i} colIndex={j}>
                        <TableCell columnKey={col.key} />
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
