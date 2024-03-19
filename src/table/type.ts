export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TTableColumn = { key: string; label?: string };

export type TPropsTable<T extends DataObject> = {
  cols: TTableColumn[];
  rows: T[];
};
