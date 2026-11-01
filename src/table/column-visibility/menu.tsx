import { useEffect, useId, useRef, useState } from "react";
import { BiColumns } from "react-icons/bi";
import { DataRecord, TTableColumn } from "../table/type";
import { useMessages } from "../locale/provider";
import { useColumnVisibility, visibleColumns } from "./provider";

/**
 * A button that opens a list of the columns with a checkbox each, to choose
 * which columns are shown. The last shown column cannot be hidden.
 */
export function ColumnSelector<T extends DataRecord>(props: {
  cols: TTableColumn<T>[];
}) {
  const messages = useMessages();
  const { hiddenKeys, setHidden, showAll } = useColumnVisibility();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const visibleKeys = new Set(
    visibleColumns(props.cols, hiddenKeys).map((col) => String(col.key))
  );
  const hideableVisibleCount = props.cols.filter(
    (col) => !col.disableHide && visibleKeys.has(String(col.key))
  ).length;
  const alwaysShownCount = props.cols.filter((col) => col.disableHide).length;

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        data-teppen-part="column-selector"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex items-center gap-1 h-full px-2 py-1 text-sm rounded-[var(--teppen-table-radius,0.375rem)] border border-[color:var(--teppen-table-search-border,#334155)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#1f2937)] hover:bg-[color:var(--teppen-table-hover,#f1f5f9)] cursor-pointer"
        onClick={() => setOpen((current) => !current)}
      >
        <BiColumns aria-hidden="true" />
        <span>{messages.columnSelector.button}</span>
        {hiddenKeys.length > 0 && visibleKeys.size < props.cols.length && (
          <span className="text-xs text-[color:var(--teppen-table-muted,#4b5563)]">
            {visibleKeys.size}/{props.cols.length}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={messages.columnSelector.title}
          className="absolute right-0 z-30 mt-1 min-w-48 max-h-80 overflow-y-auto p-2 rounded-[var(--teppen-table-radius,0.375rem)] border border-[color:var(--teppen-table-control-border,#d1d5db)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#1f2937)] text-sm shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 px-1 pb-1 mb-1 border-b border-[color:var(--teppen-table-border,#e5e7eb)]">
            <span className="font-bold">{messages.columnSelector.title}</span>
            <button
              type="button"
              className="px-2 rounded text-xs border border-[color:var(--teppen-table-control-border,#d1d5db)] hover:bg-[color:var(--teppen-table-hover,#f1f5f9)] disabled:opacity-50 disabled:cursor-default cursor-pointer"
              disabled={visibleKeys.size === props.cols.length}
              onClick={showAll}
            >
              {messages.columnSelector.showAll}
            </button>
          </div>
          <ul>
            {props.cols.map((col) => {
              const key = String(col.key);
              const shown = visibleKeys.has(key);
              // Keep at least one column shown.
              const isLastShown =
                shown && alwaysShownCount === 0 && hideableVisibleCount <= 1;
              const disabled = !!col.disableHide || isLastShown;

              return (
                <li key={key}>
                  <label
                    className={`flex items-center gap-2 px-1 py-0.5 rounded ${
                      disabled
                        ? "opacity-60"
                        : "hover:bg-[color:var(--teppen-table-hover,#f1f5f9)] cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={shown}
                      disabled={disabled}
                      onChange={(e) => setHidden(key, !e.target.checked)}
                    />
                    <span className="whitespace-nowrap">
                      {col.label ?? key}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
