import React from "react";
import { TPasteError } from "../paste/types";
import { Options } from "../../select-box";
import {
  TErrorValidation,
  TNumberValidateOption,
  TStringValidateOption,
} from "../libs/generate-validate-function";

export type DataRecord = Record<string, string | number | Date>;

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
      options: Options[];
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

export type TDateCellEditingCondition<T extends DataRecord> =
  | {
      type: "date";
      render: (value: Date) => string | React.ReactNode;
    } & {
      editable?: false;
    };

export type TDatetimeCellEditingCondition<T extends DataRecord> =
  | {
      type: "datetime";
      render: (value: Date) => string | React.ReactNode;
    } & {
      editable?: false;
    };

export type TCellEditingCondition<T extends DataRecord> =
  | TStringCellEditingCondition<T>
  | TNumberCellEditingCondition<T>
  | TSelectCellEditingCondition<T>
  | TDateCellEditingCondition<T>
  | TDatetimeCellEditingCondition<T>;

export type TColumnProperty<T extends DataRecord> = {
  key: keyof T;
  label?: string;
  disableSort?: boolean;
  disableFilter?: boolean;
  initialWidth?: number;
  minWidth?: number;
};

export type TTableColumn<T extends DataRecord> = TColumnProperty<T> &
  TCellEditingCondition<T>;

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

type TPaginationCondition = {
  /**
   * Rows per page. Defaults to 50.
   * "all" renders every row at once and gets slow with many rows; use
   * pagination for more than about 1,000 rows.
   */
  rowCountPerPage?: 20 | 50 | 100 | "all";
};

export type TPropsTable<T extends DataRecord> = {
  id?: string;
  cols: TTableColumn<T>[];
  rows: DataObject<T>[];
  maxHeight?: string;
  maxWidth?: string;
  onClickRow?: (row: DataObject<T>) => void;
  onUpdateRow?: (newRow: DataObject<T>, oldRow: DataObject<T>) => void;
  initialCondition?: {
    sort?: { key: string; asc?: boolean };
    pagination?: TPaginationCondition;
    /** @deprecated Use `pagination`. Kept for compatibility. */
    pagenation?: TPaginationCondition;
  };
  applyRowFormatting?: (row: DataObject<T>) => TailwindCssStyle;
  conditionalFormattings?: TConditionalFormatting<T>[];
  errorHandler?: (errors: TErrorValidation[]) => void;
  /**
   * Called when pasted data cannot be applied, e.g. it does not fit in the
   * table or targets a read-only column. Defaults to window.alert.
   */
  onPasteError?: (error: TPasteError) => void;
  deprecatedOptions?: {
    enableDeprecatedCopy?: boolean;
  };
} & TCheckboxProperty<T>;
