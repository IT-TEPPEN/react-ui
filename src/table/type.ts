export type DataRecord = Record<string, string | number>;

export type DataObject<T extends DataRecord> = T & {
  id: number | string;
};

export type TStringCellEditingCondition<T extends DataRecord> =
  | { type: "string" } & (
      | {
          editable?: false;
          render?: (value: string, row: DataObject<T>) => React.ReactNode;
        }
      | {
          editable: true;
          onCellBlur: (
            key: keyof T,
            value: string,
            current: DataObject<T>,
            completeEditing: () => void
          ) => void;
          constraints?: {
            maxLength?: number;
            minLength?: number;
            pattern?: string;
          };
        }
    );

export type TNumberCellEditingCondition<T extends DataRecord> =
  | {
      type: "number";
    } & (
      | {
          editable?: false;
          render?: (value: number, row: DataObject<T>) => React.ReactNode;
        }
      | {
          editable: true;
          onCellBlur: (
            key: keyof T,
            value: number,
            current: DataObject<T>,
            completeEditing: () => void
          ) => void;
          constraints?: {
            max?: number;
            min?: number;
          };
        }
    );

export type TSelectCellEditingCondition<T extends DataRecord> =
  | {
      type: "select";
      options: { value: string; label: string }[];
    } & (
      | {
          editable?: false;
          render?: (value: string, row: DataObject<T>) => React.ReactNode;
        }
      | {
          editable: true;
          allowEmpty?: boolean;
          onCellBlur: (
            key: keyof T,
            value: string,
            current: DataObject<T>,
            completeEditing: () => void
          ) => void;
        }
    );

export type TCellEditingCondition<T extends DataRecord> =
  | TStringCellEditingCondition<T>
  | TNumberCellEditingCondition<T>
  | TSelectCellEditingCondition<T>;

export type TTableColumn<T extends DataRecord> = {
  key: keyof T;
  label?: string;
  disableSort?: boolean;
  disableFilter?: boolean;
  initialWidth?: number;
  minWidth?: number;
} & TCellEditingCondition<T>;

export type TColumnType = Exclude<TTableColumn<{}>["type"], undefined>;

export type TCheckboxProperty<T extends DataRecord> = {
  checkbox?: {
    checked: (row: DataObject<T>) => boolean;
    onChecked: (row: DataObject<T>) => void;
    onUnchecked: (row: DataObject<T>) => void;
  };
};

type TailwindCssStyle = string;

export type TPropsTable<T extends DataRecord> = {
  cols: TTableColumn<T>[];
  rows: DataObject<T>[];
  onClickRow?: (row: DataObject<T>) => void;
  initialCondition?: {
    sort?: { key: string; asc?: boolean };
  };
  applyRowFormatting?: (row: DataObject<T>) => TailwindCssStyle;
} & TCheckboxProperty<T>;
