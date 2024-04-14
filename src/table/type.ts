export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TStringCellEditingCondition =
  | { type: "string" } & (
      | {
          editable?: false;
        }
      | {
          editable: true;
          onCellBlur: (
            key: string,
            value: string,
            current: DataObject,
            completeEditing: () => void
          ) => void;
          constraints?: {
            maxLength?: number;
            minLength?: number;
            pattern?: string;
          };
        }
    );

export type TNumberCellEditingCondition =
  | {
      type: "number";
    } & (
      | {
          editable?: false;
        }
      | {
          editable: true;
          onCellBlur: (
            key: string,
            value: number,
            current: DataObject,
            completeEditing: () => void
          ) => void;
          constraints?: {
            max?: number;
            min?: number;
          };
        }
    );

export type TSelectCellEditingCondition =
  | {
      type: "select";
      options: { value: string; label: string }[];
    } & (
      | {
          editable?: false;
        }
      | {
          editable: true;
          allowEmpty?: boolean;
          onCellBlur: (
            key: string,
            value: string,
            current: DataObject,
            completeEditing: () => void
          ) => void;
        }
    );

export type TComponentCellEditingCondition = {
  type: "component";
  editable?: false;
};

export type TCellEditingCondition =
  | TStringCellEditingCondition
  | TNumberCellEditingCondition
  | TSelectCellEditingCondition
  | TComponentCellEditingCondition;

export type TTableColumn = {
  key: string;
  label?: string;
} & TCellEditingCondition;

export type TColumnType = Exclude<TTableColumn["type"], undefined>;

export type TPropsTable = {
  cols: TTableColumn[];
  rows: DataObject[];
  initialCondition?: {
    sort?: { key: string; asc?: boolean };
  };
};
