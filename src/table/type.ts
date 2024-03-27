export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};

export type TStringCellEditingCondition<T extends DataObject> =
  | { type: "string" } & (
      | {
          editable?: false;
        }
      | {
          editable: true;
          onCellBlur: (
            key: string,
            value: string,
            current: T,
            completeEditing: () => void
          ) => void;
          constraints?: {
            maxLength?: number;
            minLength?: number;
            pattern?: string;
          };
        }
    );

export type TNumberCellEditingCondition<T extends DataObject> =
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
            current: T,
            completeEditing: () => void
          ) => void;
          constraints?: {
            max?: number;
            min?: number;
          };
        }
    );

export type TSelectCellEditingCondition<T extends DataObject> =
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
            current: T,
            completeEditing: () => void
          ) => void;
        }
    );

export type TComponentCellEditingCondition = {
  type: "component";
  editable?: false;
};

export type TCellEditingCondition<T extends DataObject> =
  | TStringCellEditingCondition<T>
  | TNumberCellEditingCondition<T>
  | TSelectCellEditingCondition<T>
  | TComponentCellEditingCondition;

export type TTableColumn<T extends DataObject> = {
  key: string;
  label?: string;
} & TCellEditingCondition<T>;

export type TColumnType = Exclude<TTableColumn<DataObject>["type"], undefined>;

export type TPropsTable<T extends DataObject> = {
  cols: TTableColumn<T>[];
  rows: T[];
};
