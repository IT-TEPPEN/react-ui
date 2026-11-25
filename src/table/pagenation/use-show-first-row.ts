"use client";

import { useEffect, useRef } from "react";
import { usePageContext } from "./providers";

/**
 * When the page changes (‹ ›, a page number, the rows-per-page select, or a
 * filter that goes back to page 1), shows the page from its first row: the
 * rows are scrolled to the top, and when the table's top is above the
 * screen, the page is scrolled to it. `bodyId` is the id of the rows' area.
 */
export function useShowFirstRow(bodyId: string) {
  const { enable, current, perPage } = usePageContext();
  const page = enable ? `${current}/${perPage}` : "all";
  const shown = useRef(page);

  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;

    const body = document.getElementById(bodyId);
    if (!body) return;
    body.scrollTop = 0;
    const table = body.closest('[data-teppen-part="table"]');
    if (
      table &&
      table.getBoundingClientRect().top < 0 &&
      typeof table.scrollIntoView === "function"
    ) {
      table.scrollIntoView({ block: "start" });
    }
  }, [page, bodyId]);
}
