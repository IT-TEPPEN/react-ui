export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TPropsTable<T extends DataObject> = {
  cols: { key: string; label?: string }[];
  rows: T[];
};
