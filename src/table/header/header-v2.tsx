import { memo, useEffect, useRef } from "react";
import { DataObject, DataRecord, TTableColumn } from "../table/type";
import { useColumnsWidthState } from "./columns-width";
import { useResizeColWidthHook, useScrollXRef } from "./header-v2-hook";
import { AllCheckbox } from "../checkbox/components";
import { ConditionSearchBar } from "../../search-bar";
import { useTableIdGenerator } from "../id";
import { Condition } from "../../search-bar/condition-search-bar/condition-input-management/type";

interface IPropsTableHeader<T extends DataRecord> {
  cols: TTableColumn<T>[];
  checkbox?: boolean;
  rows: DataObject<T>[];
  maxWidth?: string;
  generateSortButton?: (columnKey: string) => React.ReactNode;
}

export function TableHeader<T extends DataRecord>(props: IPropsTableHeader<T>) {
  const idGenerator = useTableIdGenerator();
  const { getColumnWidth } = useColumnsWidthState();
  const ref = useScrollXRef();

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      const scrollX = (e: WheelEvent) => {
        if (e.deltaY === 0) return;

        e.preventDefault();
        element.scrollLeft += e.deltaY;
      };

      element.addEventListener("wheel", scrollX);

      return () => {
        element.removeEventListener("wheel", scrollX);
      };
    }
  }, [ref]);

  return (
    <div
      className="border-gray-200 bg-gray-200 text-gray-600 rounded-t-md"
      style={{ maxWidth: props.maxWidth }}
    >
      <div className="py-2 px-2">
        <ConditionSearchBar
          id={idGenerator.getTableHeaderId()}
          targets={props.cols
            .filter((col) => !!col.label)
            .map((col) => ({
              key: col.key as string,
              label: col.label as string,
              type: col.type as "string" | "number",
            }))}
          onChangeCondition={(conditions: Condition[]) => {}}
          size="small"
        />
      </div>
      <div
        ref={ref}
        className="relative max-w-full overflow-x-auto no_scrollbar"
      >
        <div className="flex h-[32px]">
          {props.checkbox && (
            <th className="w-8 h-full">
              <AllCheckbox rows={props.rows} />
            </th>
          )}
          {props.cols.map((col) => {
            return (
              <HeaderElement
                key={col.key.toString()}
                keyName={col.key.toString()}
                label={col.label}
                colWidth={getColumnWidth(col.key as string)}
                disableSort={col.disableSort || (!col.editable && !!col.render)}
                generateSortButton={props.generateSortButton}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface IPropsHeaderElement {
  keyName: string;
  label?: string;
  colWidth: number;
  disableSort?: boolean;
  generateSortButton?: (columnKey: string) => React.ReactNode;
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
          {!props.disableSort &&
            props.generateSortButton &&
            props.generateSortButton(props.keyName)}
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
