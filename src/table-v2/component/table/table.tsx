"use client";

import { DataRecord, TPropsTable } from "./type";
import { TablePropertyProvider, useTablePropertyContext } from "./provider";
import { Row } from "../row/row";
import { TableHeaderElement } from "../header/header";
import { Editor } from "../editor/editor";

export function TableContent() {
  const t = useTablePropertyContext();

  return (
    <div className="w-full">
      {/* <div className="flex justify-end mb-1 mr-3">
          <TableFilterRemoveButton>
            <p className="text-xs underline text-gray-500 hover:text-gray-700">
              全てのフィルタリング条件を解除する
            </p>
          </TableFilterRemoveButton>
        </div> */}

      <div
        id="table-frame"
        className="relative h-full max-w-full max-h-[80vh] border border-gray-200 rounded-md overflow-auto"
      >
        <Editor />
        <table
          className={`table`}
          // onPaste={(e) => {
          //   e.preventDefault();
          //   const pastedData = e.clipboardData.getData("Text");
          //   onPaste(
          //     pastedData
          //       .replace(/\t/g, ",")
          //       .trim()
          //       .replace(/\r\n/g, "\n")
          //       .split("\n")
          //       .map((row) => row.split(","))
          //   );
          // }}
        >
          <thead>
            <tr className="sticky top-0 border-gray-200 z-20 bg-gray-200 text-gray-600 h-[32px]">
              {/* {props.checkbox && (
                  <th>
                    <AllCheckbox rows={props.rows} />
                  </th>
                )} */}
              {[...Array(t.getColLength())].map((_, i) => (
                <TableHeaderElement key={i} colIndex={i} />
              ))}
            </tr>
          </thead>
          <tbody>
            {/* {!!filteringColumn && (
                <tr>
                  <td
                    colSpan={cols.length}
                    className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl z-20 p-0 overflow-hidden"
                  >
                    <TableFilterForm />
                  </td>
                </tr>
              )} */}
            {t.getRowLength() === 0 && (
              <tr>
                <td colSpan={t.getColLength()} className="py-5">
                  <p className="text-center font-bold text-lg">NO DATA</p>
                </td>
              </tr>
            )}
            {[...Array(t.getRowLength())].map((_, i) => (
              <Row key={i} rowIndex={i} />
            ))}
          </tbody>
        </table>
      </div>
      {/* <div className="mt-1">
        <DisplayRange />
        <div className="mt-2">
          <Pagenation />
        </div>
      </div> */}
    </div>
  );
}

export function Table<T extends DataRecord>(props: TPropsTable<T>) {
  return (
    <TablePropertyProvider property={props as TPropsTable<DataRecord>}>
      <TableContent />
    </TablePropertyProvider>
  );
}
