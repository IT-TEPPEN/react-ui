type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

type TPropsTable<T extends DataObject> = {
  cols: { key: string; label?: string }[];
  rows: T[];
};

export default function BaseTable<T extends DataObject>(props: TPropsTable<T>) {
  const { cols, rows } = props;

  return (
    <table className={`table table-auto w-full`}>
      <thead className={`bg-gray-200 text-gray-600`}>
        <tr data-testid="table-header">
          {cols.map((col) => (
            <th key={col.key} className={``}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            data-testid={r.id}
            className={`hover:bg-gray-100`}
            onClick={r.onClick}
          >
            {cols.map((col) => (
              <td key={col.key}>
                <div
                  className={`p-2 w-fit text-left cursor-default`}
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
