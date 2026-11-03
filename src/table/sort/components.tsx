"use client";

import { SortIcon } from "./icon";
import { useSortContext } from "./provider";
import { useMessages } from "../locale/provider";

type TPropsSort = {
  columnKey: string;
};

/**
 * Click: sort by this column only. Shift+click: add this column to the sort
 * conditions (then descending, then remove it). With several conditions,
 * their priority is shown next to the icon.
 */
export function SortButton(props: TPropsSort) {
  const { sorts, click, shiftClick } = useSortContext();
  const messages = useMessages();

  const index = sorts.findIndex((sort) => sort.key === props.columnKey);
  const condition = index === -1 ? undefined : sorts[index];

  return (
    <div
      data-teppen-part="sort-button"
      title={messages.sortHint}
      onMouseDown={(e) => {
        // Shift+click would otherwise select the header text.
        if (e.shiftKey) e.preventDefault();
      }}
      onClick={(e) => {
        e.preventDefault();
        if (e.shiftKey) {
          shiftClick(props.columnKey);
        } else {
          click(props.columnKey);
        }
      }}
      className="flex items-center gap-0.5 cursor-pointer"
    >
      <SortIcon
        sortOrder={condition && !condition.asc ? "DESC" : "ASC"}
        isSortActive={!!condition}
      />
      {condition && sorts.length > 1 && (
        <span
          data-teppen-part="sort-priority"
          className="text-[10px] font-bold leading-none text-[color:var(--teppen-table-sort-icon,#374151)]"
        >
          {index + 1}
        </span>
      )}
    </div>
  );
}
