"use client";

import { useMemo } from "react";
import { usePageContext } from "./providers";
import { useMessages } from "../locale/provider";
import { pageItems } from "./page-items";

const NAV_BUTTON =
  "inline-flex items-center justify-center gap-1 h-8 px-2 rounded text-sm cursor-pointer hover:bg-[color:var(--teppen-table-hover,#f3f4f6)] disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent";

export function Pagenation() {
  const { enable, current, pageCount, jump, prev, next } = usePageContext();
  const messages = useMessages();

  if (!enable) {
    return <></>;
  }

  return (
    <nav
      data-teppen-part="pagination"
      aria-label={messages.pagination.label}
      className="flex flex-wrap items-center justify-center gap-1"
    >
      <button
        type="button"
        className={NAV_BUTTON}
        onClick={() => prev()}
        disabled={current <= 1}
      >
        <span aria-hidden="true">‹</span>
        {messages.pagination.prev}
      </button>

      {pageItems(current, Math.max(pageCount, 1)).map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            aria-label={messages.pagination.goToPage(item)}
            aria-current={item === current ? "page" : undefined}
            className={`min-w-8 h-8 px-1 rounded text-sm tabular-nums cursor-pointer ${
              item === current
                ? "font-bold bg-[color:var(--teppen-table-accent,#2563eb)] text-[color:var(--teppen-table-accent-text,#ffffff)]"
                : "hover:bg-[color:var(--teppen-table-hover,#f3f4f6)]"
            }`}
            onClick={() => jump(item)}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="min-w-6 text-center text-sm text-[color:var(--teppen-table-muted,#4b5563)]"
          >
            …
          </span>
        )
      )}

      <button
        type="button"
        className={NAV_BUTTON}
        onClick={() => next()}
        disabled={current >= pageCount}
      >
        {messages.pagination.next}
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}

export function DisplayRange() {
  const { enable, from, to, rowCount } = usePageContext();
  const messages = useMessages();

  if (!enable) {
    return <></>;
  }

  return (
    <p data-teppen-part="range" className="text-center text-sm text-[color:var(--teppen-table-muted,#4b5563)]">
      {messages.range(
        rowCount === 0 ? 0 : from + 1,
        to < rowCount ? to : rowCount,
        rowCount
      )}
    </p>
  );
}

/**
 * Lets the user choose how many rows a page shows. `options` are the
 * choices, e.g. [10, 25, 50, "all"]; invalid entries are left out with a
 * warning, and the count in use is added if it is not one of them.
 */
export function RowsPerPageSelect(props: { options: (number | "all")[] }) {
  const { enable, perPage, setPerPage } = usePageContext();
  const messages = useMessages();
  const current: number | "all" = enable ? perPage : "all";

  // Checked once per set of options, not on every render.
  const optionsKey = JSON.stringify(props.options);
  const validChoices = useMemo(() => {
    const result: (number | "all")[] = [];
    for (const option of JSON.parse(optionsKey) as unknown[]) {
      const valid =
        option === "all" ||
        (typeof option === "number" && Number.isInteger(option) && option > 0);
      if (!valid) {
        console.warn(`Ignored rows-per-page option: ${JSON.stringify(option)}`);
        continue;
      }
      if (!result.includes(option as number | "all")) {
        result.push(option as number | "all");
      }
    }
    return result;
  }, [optionsKey]);

  const choices = [...validChoices];
  if (!choices.includes(current)) choices.push(current);

  return (
    <label
      data-teppen-part="page-size"
      className="flex items-center gap-2 text-sm text-[color:var(--teppen-table-muted,#4b5563)]"
    >
      <span>{messages.rowsPerPage}</span>
      <select
        className="px-1 py-0.5 rounded border border-[color:var(--teppen-table-control-border,#d1d5db)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#111827)] cursor-pointer"
        value={String(current)}
        onChange={(e) =>
          setPerPage(e.target.value === "all" ? "all" : Number(e.target.value))
        }
      >
        {choices.map((choice) => (
          <option key={String(choice)} value={String(choice)}>
            {messages.rowsPerPageOption(choice)}
          </option>
        ))}
      </select>
    </label>
  );
}
