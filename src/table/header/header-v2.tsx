import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { DataObject, DataRecord, TTableColumn } from "../table/type";
import { useColumnsWidthState } from "./columns-width";
import { useResizeColWidthHook, useScrollXRef } from "./header-v2-hook";
import { AllCheckbox } from "../checkbox/components";
import { ConditionSearchBar } from "../../search-bar";
import { useTableIdGenerator } from "../id";
import { useFilter } from "../filter-v2";
import {
  Target,
  TConditionChangeAction,
} from "../../search-bar/condition-search-bar/condition-input-management/type";
import { KEYWORD_TARGET_KEY } from "../../share/search-operator";
import { useMessages } from "../locale/provider";
import { isFilterable, isSortable } from "../table/column-options";


// The checkbox header stays at the left edge with pinned columns.
const PINNED_HEADER_CHECKBOX: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
};

interface IPropsTableHeader<T extends DataRecord> {
  cols: TTableColumn<T>[];
  checkbox?: boolean;
  rows: DataObject<T>[];
  maxWidth?: string;
  generateSortButton?: (columnKey: string) => React.ReactNode;
}

export function TableHeader<T extends DataRecord>(props: IPropsTableHeader<T>) {
  const idGenerator = useTableIdGenerator();
  const { getColumnWidth, getColumn, checkboxPinned } = useColumnsWidthState();
  const { conditions, mode, addFilter, removeFilter, setMode } = useFilter();
  const messages = useMessages();
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

  const onChangeCondition = useCallback((action: TConditionChangeAction) => {
    switch (action.type) {
      case "add":
        addFilter(action.payload.condition);
        break;
      case "remove":
        removeFilter(action.payload.index);
        break;
    }
  }, []);

  const columnTargets = props.cols
    .filter((col) => isFilterable(col))
    .filter((col) => !!col.label)
    .map((col): Target => {
      const base = { key: col.key.toString(), label: col.label as string };
      return col.type === "select"
        ? { ...base, type: col.type, options: col.options }
        : { ...base, type: col.type };
    });

  // Keyed on the content, so that a new cols array with the same columns
  // (e.g. defined inline) does not reset a condition being entered.
  const targetsKey = JSON.stringify([messages.allColumns, columnTargets]);
  const targets = useMemo(
    () =>
      columnTargets.length === 0
        ? []
        : [
            {
              key: KEYWORD_TARGET_KEY,
              label: messages.allColumns,
              type: "string" as const,
            },
            ...columnTargets,
          ],
    [targetsKey]
  );

  return (
    <div
      data-teppen-part="header"
      className="border-[color:var(--teppen-table-border,#e5e7eb)] bg-[color:var(--teppen-table-header-bg,#e5e7eb)] text-[color:var(--teppen-table-header-text,#4b5563)] rounded-t-[var(--teppen-table-radius,0.375rem)]"
      style={{ maxWidth: props.maxWidth }}
    >
      <div className="py-2 px-2">
        <ConditionSearchBar
          id={idGenerator.getTableHeaderId()}
          targets={targets}
          conditions={conditions}
          onChangeCondition={onChangeCondition}
          mode={mode}
          onChangeMode={setMode}
          size="small"
        />
      </div>

      <style>{`
          .teppen-no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .teppen-no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      <div
        ref={ref}
        className="relative max-w-full overflow-x-auto teppen-no-scrollbar"
      >
        <div className="flex h-[32px]">
          {props.checkbox && (
            <div
              className="w-8 min-w-8 shrink-0 h-full bg-[color:var(--teppen-table-header-bg,#e5e7eb)]"
              style={checkboxPinned ? PINNED_HEADER_CHECKBOX : undefined}
            >
              <AllCheckbox rows={props.rows} />
            </div>
          )}
          {props.cols.map((col) => {
            return (
              <HeaderElement
                key={col.key.toString()}
                keyName={col.key.toString()}
                label={col.label}
                colWidth={getColumnWidth(col.key as string)}
                pinnedLeft={getColumn(col.key as string)?.pinnedLeft}
                lastPinned={getColumn(col.key as string)?.lastPinned}
                disableSort={!isSortable(col)}
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
  /** For a pinned column: its distance from the left edge (px). */
  pinnedLeft?: number;
  lastPinned?: boolean;
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
      data-teppen-part="header-cell"
      className="relative"
      style={{
        width: props.colWidth,
        maxWidth: props.colWidth,
        minWidth: props.colWidth,
        ...(props.pinnedLeft !== undefined && {
          position: "sticky",
          left: props.pinnedLeft,
          zIndex: 1,
          boxShadow: props.lastPinned
            ? "inset -1px 0 0 var(--teppen-table-pinned-border, #cbd5e1)"
            : undefined,
        }),
      }}
    >
      <div
        className={`flex justify-between items-center bg-[color:var(--teppen-table-header-bg,#e5e7eb)] text-[color:var(--teppen-table-header-text,#4b5563)] h-[32px]`}
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
        <div className={`w-[1px] h-full bg-[color:var(--teppen-table-bg,#ffffff)]`} />
      </div>
    </div>
  );
});
