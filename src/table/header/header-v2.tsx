import { memo, useRef } from "react";
import { DataRecord, TTableColumn } from "../table/type";
import { useColumnsWidthState } from "./columns-width";
import { useResizeColWidthHook, useScrollXRef } from "./header-v2-hook";

interface IPropsTableHeader<T extends DataRecord> {
  cols: TTableColumn<T>[];
}

export function TableHeader<T extends DataRecord>(props: IPropsTableHeader<T>) {
  const { getColumnWidth } = useColumnsWidthState();
  const ref = useScrollXRef();

  return (
    <div ref={ref} className="relative max-w-full overflow-x-auto no_scrollbar">
      <div className="flex border-gray-200 bg-gray-200 text-gray-600 h-[32px]">
        {props.cols.map((col) => {
          return (
            <HeaderElement
              key={col.key.toString()}
              keyName={col.key.toString()}
              label={col.label}
              colWidth={getColumnWidth(col.key as string)}
              disableSort={col.disableSort}
              disableFilter={col.disableFilter}
            />
          );
        })}
      </div>
    </div>
  );
}

interface IPropsHeaderElement {
  keyName: string;
  label?: string;
  colWidth: number;
  disableSort?: boolean;
  disableFilter?: boolean;
}

const HeaderElement = memo(function HE(props: IPropsHeaderElement) {
  const ref = useRef<HTMLDivElement>(null);
  const { onMouseDownResizeWidth } = useResizeColWidthHook(props.keyName);

  const maxWidthLabel = ref.current
    ? props.colWidth - ref.current.clientWidth
    : props.colWidth;

  return (
    <div
      className="relative"
      style={{
        width: props.colWidth,
        maxWidth: props.colWidth,
        minWidth: props.colWidth,
      }}
    >
      <div
        className={`flex justify-between items-center bg-gray-200 text-gray-600 h-[32px]`}
      >
        <div className="px-2" style={{ maxWidth: maxWidthLabel }}>
          {props.label && (
            <p
              className={`text-left font-bold text-nowrap overflow-hidden text-ellipsis`}
            >
              {props.label}
            </p>
          )}
        </div>

        <div ref={ref} className="flex items-center w-fit shrink-0 gap-1 px-1">
          {!props.disableSort && <></>}
          {!props.disableFilter && !!props.label && <></>}
        </div>
      </div>
      <div
        className="absolute top-0 right-0 grid place-items-end py-1 w-[4px] h-full cursor-col-resize"
        onMouseDown={onMouseDownResizeWidth}
      >
        <div className={`w-[1px] h-full bg-white`} />
      </div>
    </div>
  );
});
