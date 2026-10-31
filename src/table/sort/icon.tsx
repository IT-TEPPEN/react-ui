import { memo } from "react";

type TPropsSortIcon = {
  sortOrder?: "ASC" | "DESC";
  isSortActive?: boolean;
  size?: number;
};

const SortIcon = memo(function SI(props: TPropsSortIcon) {
  const size = props.size || 16;
  const order = props.sortOrder || "ASC";

  return (
    <div
      className="relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div
        className={`absolute top-1/2 right-0 w-[40%] h-[20%] duration-300 ${
          order === "ASC" ? "-translate-y-[250%]" : "translate-y-[150%]"
        } ${
          props.isSortActive
            ? "bg-[color:var(--teppen-table-sort-icon,#374151)]"
            : "bg-[color:var(--teppen-table-header-bg,#e5e7eb)] border border-[color:var(--teppen-table-sort-icon-border,#6b7280)]"
        }`}
      ></div>
      <div
        className={`absolute top-1/2 right-0 w-[70%] h-[20%] duration-300 -translate-y-1/2  ${
          props.isSortActive
            ? "bg-[color:var(--teppen-table-sort-icon,#374151)]"
            : "bg-[color:var(--teppen-table-header-bg,#e5e7eb)] border border-[color:var(--teppen-table-sort-icon-border,#6b7280)]"
        }`}
      ></div>
      <div
        className={`absolute top-1/2 right-0 w-full h-[20%] duration-300 ${
          order === "ASC" ? "translate-y-[150%]" : "-translate-y-[250%]"
        }  ${
          props.isSortActive
            ? "bg-[color:var(--teppen-table-sort-icon,#374151)]"
            : "bg-[color:var(--teppen-table-header-bg,#e5e7eb)] border border-[color:var(--teppen-table-sort-icon-border,#6b7280)]"
        }`}
      ></div>
    </div>
  );
});

export { SortIcon };
