type TPropsTableHeader = {
  label?: string;
  sortConponent?: JSX.Element;
};

export function TableHeaderElement(props: TPropsTableHeader) {
  return (
    <th className={`relative bg-gray-200 text-gray-600 h-[32px]`}>
      <div className="px-2">
        <p className="text-left font-bold text-nowrap overflow-hidden text-ellipsis w-[90%]">
          {props.label}
        </p>
      </div>

      {props.sortConponent && (
        <div className="absolute top-1/2 right-1 -translate-y-1/2">
          {props.sortConponent}
        </div>
      )}
    </th>
  );
}
