/** A page number, or a gap ("…") between page numbers. */
export type TPageItem = number | "gap-start" | "gap-end";

/**
 * The page numbers to show: always the first and the last page, and the
 * pages around the current one, with gaps in between. The number of items
 * stays the same (2 × siblings + 5) once there are enough pages, so the
 * buttons do not move around while paging.
 *
 * pageItems(6, 12) -> [1, "gap-start", 4, 5, 6, 7, 8, "gap-end", 12]
 */
export function pageItems(
  current: number,
  pageCount: number,
  siblings = 2
): TPageItem[] {
  const slots = siblings * 2 + 5;
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  if (pageCount <= slots) {
    return range(1, pageCount);
  }

  // How many pages fit next to an end without a gap.
  const edge = slots - 2;

  if (current <= edge - siblings) {
    return [...range(1, edge), "gap-end", pageCount];
  }
  if (current >= pageCount - edge + siblings + 1) {
    return [1, "gap-start", ...range(pageCount - edge + 1, pageCount)];
  }
  return [
    1,
    "gap-start",
    ...range(current - siblings, current + siblings),
    "gap-end",
    pageCount,
  ];
}
