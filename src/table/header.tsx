import { TableFilter } from "./filter";
import { useColumnContext } from "./sheet";
import { SortButton } from "./sort";

type TPropsTableHeader = {
  columnKey: string;
};

export function TableHeaderElement(props: TPropsTableHeader) {
  const col = useColumnContext(props.columnKey);

  return (
    <th className={`relative bg-gray-200 text-gray-600 h-[32px]`}>
      {col.label && (
        <div className="px-2">
          <p
            className={`text-left font-bold text-nowrap overflow-hidden text-ellipsis w-[70%] min-w-20`}
          >
            {col.label}
          </p>
        </div>
      )}

      <div className="absolute flex items-center gap-1 top-1/2 right-1 -translate-y-1/2">
        {!col.disableSort && <SortButton columnKey={props.columnKey} />}
        {!col.disableFilter && <TableFilter columnKey={props.columnKey} />}
      </div>
    </th>
  );
}
