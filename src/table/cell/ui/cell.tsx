"use client";

import { useCell } from "../../hook";
import { EditButton } from "./edit-button";
import { IdGenerator } from "../../libs";

export function TableCell(props: {
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  editable: boolean;
  cellFormatClassName?: string;
  isExistOnClickRow: boolean;
  isExistOnUpdateRow: boolean;
}) {
  const { type, component, focusAtCell, onDoubleClickCellToEdit } = useCell(
    props.rowIndex,
    props.colIndex
  );

  const id = IdGenerator.getTableCellId(props.rowIndex, props.colIndex);

  return (
    <td id={id} className={`${props.cellFormatClassName}`}>
      <div
        className={`relative`}
        onClick={
          !props.isExistOnClickRow
            ? (e) => {
                e.preventDefault();
                focusAtCell();
              }
            : undefined
        }
        onDoubleClick={
          !props.isExistOnClickRow ? onDoubleClickCellToEdit : undefined
        }
      >
        <div
          className={`flex items-center gap-3 w-f-displayit p-2 cursor-default`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            focusAtCell();
          }}
        >
          {type === "component" ? (
            component
          ) : (
            <div onDoubleClick={onDoubleClickCellToEdit}>
              <p className="cell-data text-left whitespace-nowrap">
                {component}
              </p>
            </div>
          )}
          {props.editable && <EditButton />}
        </div>
      </div>
    </td>
  );
}
