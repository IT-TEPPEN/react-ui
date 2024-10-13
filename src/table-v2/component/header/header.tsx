"use client";

// import { useRef } from "react";
// import { TableFilter } from "../filter";
// import { SortButton } from "../sort";
// import { useResizeColWidthHook } from "./resize-col-width-hook";
import { useHeaderElement } from "./hook";

type TPropsTableHeader = {
  colIndex: number;
};

export function TableHeaderElement(props: TPropsTableHeader) {
  const { id, label } = useHeaderElement(props.colIndex);
  // const { colWidth, onMouseDownResizeWidth } = useResizeColWidthHook({
  //   initialWidth: col.initialWidth,
  //   minWidth: col.minWidth,
  // });
  // const ref = useRef<HTMLDivElement>(null);

  // const maxWidthLabel = ref.current
  //   ? colWidth - ref.current.clientWidth
  //   : colWidth;

  return (
    <th
      id={id}
      className="relative"
      // style={{ width: colWidth, maxWidth: colWidth, minWidth: colWidth }}
    >
      <div
        className={`flex justify-between items-center bg-gray-200 text-gray-600 h-[32px]`}
      >
        <div
          className="px-2"
          // style={{ maxWidth: maxWidthLabel }}
        >
          {label !== "" && (
            <p
              className={`text-left font-bold text-nowrap overflow-hidden text-ellipsis`}
            >
              {label}
            </p>
          )}
        </div>

        {/* <div ref={ref} className="flex items-center w-fit shrink-0 gap-1 px-1">
          {!col.disableSort && <SortButton columnKey={col.key.toString()} />}
          {!col.disableFilter && !!col.label && <TableFilter col={col} />}
        </div> */}
      </div>
      {/* <div
        className="absolute top-0 right-0 grid place-items-end py-1 w-[4px] h-full cursor-col-resize"
        onMouseDown={onMouseDownResizeWidth}
      >
        <div className={`w-[1px] h-full bg-white`} />
      </div> */}
    </th>
  );
}