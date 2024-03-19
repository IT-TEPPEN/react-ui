export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TColumnType = "string" | "number";

export type TTableColumn = { key: string; label?: string; type?: TColumnType };

export type TPropsTable<T extends DataObject> = {
  cols: TTableColumn[];
  rows: T[];
};
