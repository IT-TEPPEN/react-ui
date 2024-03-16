import { SortIcon } from "./sort-icon";

type TPropsSort = {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isSortedByThis: boolean;
  sortOrder: "ASC" | "DESC";
};

export function Sort(props: TPropsSort) {
  return (
    <div onClick={props.onClick} className="cursor-pointer">
      <SortIcon
        sortOrder={props.isSortedByThis ? props.sortOrder : "ASC"}
        isSortActive={props.isSortedByThis}
      />
    </div>
  );
}
