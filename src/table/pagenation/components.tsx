"use client";

import { usePageContext } from "./providers";

export function Pagenation() {
  const { current, pageCount, jump, prev, next } = usePageContext();

  return (
    <div className="flex justify-center gap-2">
      <button
        className="text-sm"
        onClick={() => jump(1)}
        disabled={current === 1}
      >
        &#x226A;
      </button>
      <button
        className="text-sm"
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
            className={`text-sm ${current === i ? "text-blue-600" : ""}`}
            onClick={() => jump(i)}
          >
            {i}
          </button>
        ))}
      <button
        className="text-sm"
        onClick={() => next()}
        disabled={current === pageCount}
      >
        &gt;
      </button>
      <button
        className="text-sm"
        onClick={() => jump(pageCount)}
        disabled={current === pageCount}
      >
        &#x226B;
      </button>
    </div>
  );
}

export function DisplayRange() {
  const { from, to, rowCount } = usePageContext();

  return (
    <p className="text-center text-sm text-gray-600">
      {from + 1} - {to < rowCount ? to : rowCount} of {rowCount}
    </p>
  );
}
