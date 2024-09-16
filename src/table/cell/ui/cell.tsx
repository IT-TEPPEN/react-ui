"use client";

import { useCell } from "../../hook";
import { EditButton } from "./edit-button";
import { StringCellInput } from "./string-input";
import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";
import { memo } from "react";
import { DataObject, DataRecord, TColumnType } from "../../type";
import { IdGenerator } from "../../libs";
import { CellProvider, useCellContext } from "../provider";
import { useColumnContext } from "../../sheet";

const CellData = memo(function CD(props: {
  type: TColumnType | "component";
  onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  component?: React.ReactNode;
}) {
  return (
    <>
      {props.type === "component" ? (
        props.component
      ) : (
        <div onDoubleClick={props.onDoubleClick}>
          <p className="cell-data text-left whitespace-nowrap">
            {props.component}
          </p>
        </div>
      )}
    </>
  );
});

const WithEditor = memo(function WE(props: {
  id: string;
  editable: boolean;
  cellFormatClassName?: string;
  focusAtCell: () => void;
  onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement>;
  preventPropagation: React.MouseEventHandler<HTMLDivElement>;
  pasteData: (text: string) => void;
  isExistOnClickRow: boolean;
  isExistOnUpdateRow: boolean;
}) {
  const cell = useCellContext();

  return (
    <td
      id={props.id}
      onPaste={(e) => {
        e.preventDefault();
        if (!props.isExistOnUpdateRow) {
          alert("ペースト機能が有効化されていません。");
          return;
        }
        props.pasteData(e.clipboardData.getData("text"));
      }}
      className={`${props.cellFormatClassName}`}
    >
      <div
        className={`relative`}
        onClick={
          !props.isExistOnClickRow
            ? (e) => {
                e.preventDefault();
                props.focusAtCell();
              }
            : undefined
        }
        onDoubleClick={
          !props.isExistOnClickRow ? props.onDoubleClickCellToEdit : undefined
        }
      >
        <div id={`${props.id}-display`}>
          <div
            className={`flex items-center gap-3 w-fit p-2 cursor-default`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.focusAtCell();
            }}
          >
            <CellData
              type={cell.type}
              component={cell.component}
              onDoubleClick={props.onDoubleClickCellToEdit}
            />
            {props.editable && <EditButton />}
          </div>
        </div>

        {props.editable && (
          <div
            id={`${props.id}-editor`}
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={props.preventPropagation}
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            {cell.type === "string" && <StringCellInput />}
            {cell.type === "number" && <NumberCellInput />}
            {cell.type === "select" && <SelectCellInput />}
          </div>
        )}
      </div>
    </td>
  );
});

export function TableCell<T extends DataRecord>(props: {
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  isExistOnClickRow: boolean;
  cellFormatClassName?: string;
  onUpdateRow?: (newRow: DataObject<T>, oldRow: DataObject<T>) => void;
}) {
  const {
    focusAtCell,
    onDoubleClickCellToEdit,
    preventPropagation,
    pasteData,
  } = useCell(props.rowIndex, props.colIndex);
  const col = useColumnContext(props.columnKey);

  return (
    <CellProvider columnKey={props.columnKey}>
      <WithEditor
        id={IdGenerator.getTableCellId(props.rowIndex, props.colIndex)}
        editable={col.editable ?? false}
        cellFormatClassName={props.cellFormatClassName}
        focusAtCell={focusAtCell}
        onDoubleClickCellToEdit={onDoubleClickCellToEdit}
        preventPropagation={preventPropagation}
        pasteData={pasteData}
        isExistOnClickRow={props.isExistOnClickRow}
        isExistOnUpdateRow={!!props.onUpdateRow}
      />
    </CellProvider>
  );
}
