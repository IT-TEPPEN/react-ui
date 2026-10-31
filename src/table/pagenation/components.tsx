"use client";

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
