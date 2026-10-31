import React from "react";
import { TPasteError } from "../paste/types";
import { TLocale } from "../locale/messages";
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

/** A value that sortValue / filterValue can return. */
export type TCellSortValue = string | number | Date | null | undefined;

export type TColumnProperty<T extends DataRecord> = {
  key: keyof T;
  label?: string;
  /**
   * true turns sorting off for the column. A read-only column with render is
   * not sorted unless this is set to false (it is sorted by its value in
   * rows, which may differ from what render shows).
   */
  disableSort?: boolean;
  /**
   * true turns filtering (and the all-columns search) off for the column. A
   * read-only column with render is not filtered unless this is set to false.
   */
  disableFilter?: boolean;
  /**
   * The value to sort this column by, instead of its value in rows. For
   * example, the name shown for an id: `(row) => userNames[row.ownerId]`.
   * Setting it on a column with render also makes it sortable.
   */
  sortValue?: (row: DataObject<T>) => TCellSortValue;
  /**
   * The value to filter this column by (and to look in with the all-columns
   * search), instead of its value in rows. It is compared with the
   * operators of the column's type. Setting it on a column with render also
   * makes it filterable.
   */
  filterValue?: (row: DataObject<T>) => TCellSortValue;
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

/** Operators for filters given or reported through the Table props. */
export type TFilterOperator =
  | "eq"
  | "neq"
  | "like"
  | "not_like"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is_null"
  | "is_not_null"
  | "in"
  | "not_in";

/**
 * A filter condition. `key` is a column key, or "*" to search every column
 * (like / not_like only). `value` is text, a number, a Date, an option value
 * or, for in / not_in, a list of option values; omitted for is_null /
 * is_not_null.
 */
export type TFilter = {
  key: string;
  operator: TFilterOperator;
  value?: string | number | Date | string[];
};

/** The filters and sort the table is showing (see onConditionChange). */
export type TTableCondition = {
  filters: TFilter[];
  filterMode: "and" | "or";
  sort: { key: string; asc: boolean };
};

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
    /** Filters applied when the table first renders. */
    filters?: TFilter[];
    /** How the filters are combined. Defaults to "and". */
    filterMode?: "and" | "or";
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
  /**
   * Called with the filters and sort, and the rows that pass the filters in
   * the shown order (all pages), when the table first renders and whenever
   * they change. The condition has the same shape as initialCondition, so it
   * can be saved and passed back to restore the view.
   */
  onConditionChange?: (
    condition: TTableCondition,
    rows: DataObject<T>[]
  ) => void;
  /**
   * Class name and style for the table's outer element, for example to set
   * the --teppen-table-* CSS variables for this table only.
   */
  className?: string;
  style?: React.CSSProperties;
  /**
   * Shows that rows are being loaded: "読み込み中…" / "Loading…" in place of
   * the empty message, or over the rows while they are reloaded.
   */
  loading?: boolean;
  /** Shown when the table has no rows. Defaults to the locale's message. */
  noDataMessage?: React.ReactNode;
  /**
   * Language of the messages the table shows by itself, such as the default
   * validation alert and the "copied" notice. Defaults to "ja".
   */
  locale?: TLocale;
  deprecatedOptions?: {
    enableDeprecatedCopy?: boolean;
  };
} & TCheckboxProperty<T>;
