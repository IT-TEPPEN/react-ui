export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TStringCellEditingCondition = {
  type: "string";
  editable?: boolean;
  onCellBlur?: (
    id: string | number,
    value: string,
    current: string,
    completeEditing: () => void
  ) => void;
  constraints?: {
    maxLength?: number;
    minLength?: number;
    pattern?: string;
  };
};

export type TNumberCellEditingCondition = {
  type: "number";
  editable?: boolean;
  onCellBlur?: (
    id: string | number,
    value: number,
    current: number,
    completeEditing: () => void
  ) => void;
  constraints?: {
    max?: number;
    min?: number;
  };
};

export type TCellEditingCondition =
  | TStringCellEditingCondition
  | TNumberCellEditingCondition;

export type TTableColumn = {
  key: string;
  label?: string;
} & TCellEditingCondition;

export type TColumnType = Exclude<TTableColumn["type"], undefined>;

export type TPropsTable<T extends DataObject> = {
  cols: TTableColumn[];
  rows: T[];
};
