import { tv } from "tailwind-variants";

type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

type TPropsTable<T extends DataObject> = {
  cols: { key: string; label?: string }[];
  rows: T[];
};

const tvTableDesign = tv({
  slots: {
    frame: "table table-auto w-full",
    header: "bg-gray-200 text-gray-600",
    row: "hover:bg-gray-100",
    cell: "p-2 w-fit text-left cursor-default",
  },
  variants: {
    hover: {
      true: {
        row: "hover:cursor-pointer",
      },
    },
  },
});

export default function BaseTable<T extends DataObject>(props: TPropsTable<T>) {
  const { cols, rows } = props;
  const { frame, cell, row, header } = tvTableDesign({
    hover: !!rows[0]?.onClick,
  });
  return (
    <table className={frame()}>
      <thead className={header()}>
        <tr>
          {cols.map((col) => (
            <th key={col.key} className={cell()}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className={row()}
            onClick={r.onClick}
            data-testid={r.id}
          >
            {cols.map((col) => (
              <td key={col.key}>
                <div
                  className={cell()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {r[col.key]}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
