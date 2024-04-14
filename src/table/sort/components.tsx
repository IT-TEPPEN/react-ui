"use client";

import { SortIcon } from "./icon";
import { useSortContext } from "./provider";

type TPropsSort = {
  keyName: string;
};

export function SortButton(props: TPropsSort) {
  const { key, asc, changeKey, changeOrder } = useSortContext();

  const isActive = key === props.keyName;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        if (isActive) {
          changeOrder();
        } else {
          changeKey(props.keyName);
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
