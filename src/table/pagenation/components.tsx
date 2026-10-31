"use client";

import { useMemo } from "react";
import { usePageContext } from "./providers";
import { useMessages } from "../locale/provider";

export function Pagenation() {
  const { enable, current, pageCount, jump, prev, next } = usePageContext();

  if (!enable) {
    return <></>;
  }

  return (
    <div data-teppen-part="pagination" className="flex justify-center gap-2">
      <button
        className="text-sm cursor-pointer disabled:cursor-default"
        onClick={() => jump(1)}
        disabled={current === 1}
      >
        &#x226A;
      </button>
      <button
        className="text-sm cursor-pointer disabled:cursor-default"
        onClick={() => prev()}
        disabled={current === 1}
      >
        &lt;
      </button>
      {Array.from({ length: pageCount }, (_, i) => i + 1)
        .filter((i) => current - 2 <= i && i <= current + 2)
        .map((i) => (
          <button
            key={i}
            className={`text-sm cursor-pointer disabled:cursor-default ${current === i ? "text-[color:var(--teppen-table-accent,#2563eb)]" : ""}`}
            onClick={() => jump(i)}
          >
            {i}
          </button>
        ))}
      <button
        className="text-sm cursor-pointer disabled:cursor-default"
        onClick={() => next()}
        disabled={current >= pageCount}
      >
        &gt;
      </button>
      <button
        className="text-sm cursor-pointer disabled:cursor-default"
        onClick={() => jump(pageCount)}
        disabled={current >= pageCount}
      >
        &#x226B;
      </button>
    </div>
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
