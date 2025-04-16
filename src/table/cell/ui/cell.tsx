"use client";

import { useTableIdGenerator } from "../../id";
import { DataObject, DataRecord } from "../../table/type";
import { useCell } from "../hooks";

export function TableCell(props: {
  id: string;
  row: DataObject<DataRecord>;
  editable: boolean;
  cellFormatClassName?: string;
  isExistOnClickRow: boolean;
}) {
  const IdGenerator = useTableIdGenerator();
  const { type, component, onDoubleClick, onMouseDown, onMouseEnter } = useCell(
    props.id,
    props.row
  );
  const [_, colIndex] = IdGenerator.extractCellIndexFromId(props.id);

  return (
    <td
      id={props.id}
      className={`table-col-${colIndex} ${props.cellFormatClassName}`}
      onDoubleClick={!props.isExistOnClickRow ? onDoubleClick : undefined}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      <div
        className={`flex items-center gap-3 min-h-10 w-fit max-w-full p-2 cursor-default`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {type === "component" ? (
          component
        ) : (
          <div onDoubleClick={onDoubleClick} className="max-w-full">
            <p
              className={`text-left max-w-full select-none overflow-hidden whitespace-nowrap text-ellipsis`}
            >
              {component}
            </p>
          </div>
        )}
      </div>
    </td>
  );
}
