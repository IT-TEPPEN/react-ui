"use client";

import { EditButton } from "./edit-button";
import { DataObject, DataRecord } from "../../table/type";
import { useCell } from "../hooks";

export function TableCell(props: {
  id: string;
  row: DataObject<DataRecord>;
  editable: boolean;
  cellFormatClassName?: string;
  isExistOnClickRow: boolean;
}) {
  const { type, component, onClickCell, onDoubleClick } = useCell(
    props.id,
    props.row
  );

  return (
    <td
      id={props.id}
      className={`${props.cellFormatClassName}`}
      onClick={!props.isExistOnClickRow ? onClickCell : undefined}
      onDoubleClick={!props.isExistOnClickRow ? onDoubleClick : undefined}
    >
      <div
        className={`flex items-center gap-3 w-fit p-2 cursor-default`}
        onClick={onClickCell}
      >
        {type === "component" ? (
          component
        ) : (
          <div onDoubleClick={onDoubleClick}>
            <p className="cell-data text-left whitespace-nowrap">{component}</p>
          </div>
        )}
        {props.editable && <EditButton />}
      </div>
    </td>
  );
}
