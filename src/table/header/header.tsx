import { TableFilter } from "../filter";
import { useColumnContext } from "../sheet";
import { SortButton } from "../sort";
import { useResizeColWidthHook } from "./resize-col-width-hook";

type TPropsTableHeader = {
  columnKey: string;
};

export function TableHeaderElement(props: TPropsTableHeader) {
  const col = useColumnContext(props.columnKey);
  const { colWidth, onMouseDownResizeWidth } = useResizeColWidthHook({
    initialWidth: col.initialWidth,
    minWidth: col.minWidth,
  });

  return (
    <th className="relative" style={{ minWidth: colWidth }}>
      <div
        className={`flex justify-between items-center bg-gray-200 text-gray-600 h-[32px] min-w-fit`}
      >
        <div className="px-2">
          {col.label && (
            <p
              className={`text-left font-bold text-nowrap overflow-hidden text-ellipsis w-[70%] min-w-20`}
            >
              {col.label}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 px-1">
          {!col.disableSort && <SortButton columnKey={props.columnKey} />}
          {!col.disableFilter && <TableFilter columnKey={props.columnKey} />}
        </div>
      </div>
      <div
        className="absolute top-0 right-0 grid place-items-end py-1 w-[4px] h-full cursor-col-resize"
        onMouseDown={onMouseDownResizeWidth}
      >
        <div className={`w-[1px] h-full bg-white`} />
      </div>
    </th>
  );
}
