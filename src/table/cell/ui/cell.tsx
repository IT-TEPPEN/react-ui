"use client";

import { DataObject, DataRecord } from "../../table/type";
import { useCell } from "../hooks";

export function TableCell(props: {
  id: string;
  row: DataObject<DataRecord>;
  editable: boolean;
  cellFormatClassName?: string;
  isExistOnClickRow: boolean;
}) {
  const { type, component, onDoubleClick, onMouseDown, onMouseEnter } = useCell(
    props.id,
    props.row
  );

  return (
    <td
      id={props.id}
      className={`${props.cellFormatClassName} select-none`}
      onDoubleClick={!props.isExistOnClickRow ? onDoubleClick : undefined}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      <div
        className={`flex items-center gap-3 min-h-10 w-fit p-2 cursor-default`}
      >
        {type === "component" ? (
          component
        ) : (
          <div onDoubleClick={onDoubleClick}>
            <p className="cell-data text-left whitespace-nowrap">{component}</p>
          </div>
        )}
      </div>
    </td>
  );
}
