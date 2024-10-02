import {
  TErrorValidation,
  TNumberValidateOption,
  TStringValidateOption,
} from "./libs/generate-validate-function";

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
          constraints?: TStringValidateOption;
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
          constraints?: TNumberValidateOption;
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

export type TConditionalFormatting<T extends DataRecord> = {
  condition: (row: DataObject<T>) => boolean;
  key: keyof T;
  style: TailwindCssStyle;
};

type TailwindCssStyle = string;

export type TPropsTable<T extends DataRecord> = {
  cols: TTableColumn<T>[];
  rows: DataObject<T>[];
  onClickRow?: (row: DataObject<T>) => void;
  onUpdateRow?: (newRow: DataObject<T>, oldRow: DataObject<T>) => void;
  initialCondition?: {
    sort?: { key: string; asc?: boolean };
    pagenation?: {
      rowCountPerPage?: 20 | 50 | 100 | "all";
    };
  };
  applyRowFormatting?: (row: DataObject<T>) => TailwindCssStyle;
  conditionalFormattings?: TConditionalFormatting<T>[];
  errorHandler?: (errors: TErrorValidation[]) => void;
} & TCheckboxProperty<T>;
