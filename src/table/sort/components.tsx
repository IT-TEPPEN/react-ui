"use client";

import { useColumnContext } from "../sheet";
import { SortIcon } from "./icon";
import { useSortContext } from "./provider";

type TPropsSort = {
  columnKey: string;
};

export function SortButton(props: TPropsSort) {
  const col = useColumnContext(props.columnKey);
  const { key, asc, changeKey, changeOrder } = useSortContext();

  const isActive = key === props.columnKey;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        if (isActive) {
          changeOrder();
        } else {
          changeKey(props.columnKey);
        }
      }}
      className="cursor-pointer"
    >
      <SortIcon
        sortOrder={isActive ? (asc ? "ASC" : "DESC") : "ASC"}
        isSortActive={isActive}
      />
    </div>
  );
}
