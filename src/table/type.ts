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
} & TCellEditingCondition<T>;

export type TTableExtendedColumn<S extends string> = {
  key: S;
} & (
  | {
      type: "string";
    }
  | {
      type: "number";
    }
  | {
      type: "select";
      options: { value: string; label: string }[];
    }
);

export type TTableExetendedColumnDefine<
  T extends DataRecord,
  S extends string,
  U extends TTableExtendedColumn<S>
> = {
  update: (
    row: DataObject<T>
  ) => Promise<
    U["type"] extends "string"
      ? string
      : U["type"] extends "number"
      ? number
      : string
  >;
};

export type TTableAsincData<
  S extends string,
  U extends TTableExtendedColumn<S>
> = {
  key: S;
} & (
  | {
      isLoading: false;
      value: U["type"] extends "string"
        ? string
        : U["type"] extends "number"
        ? number
        : string;
      label: U["type"] extends "select" ? string : never;
    }
  | {
      isLoading: false;
      error: any;
    }
  | {
      isLoading: true;
    }
);

export type TColumnType = Exclude<TTableColumn<{}>["type"], undefined>;

type TailwindCssStyle = string;

export type TAsyncDataObject = {};

export type TPropsTable<
  T extends DataRecord,
  S extends string,
  U extends TTableExtendedColumn<S>
> = {
  cols: TTableColumn<T>[];
  rows: DataObject<T>[];
  asyncCols?: (U & TTableExetendedColumnDefine<T, S, U>)[];
  onClickRow?: (row: DataObject<T>, asyncData: TTableAsincData<S, U>[]) => void;
  initialCondition?: {
    sort?: { key: string; asc?: boolean };
  };
  applyRowFormatting?: (
    row: DataObject<T>,
    asyncData: TTableAsincData<S, U>[]
  ) => TailwindCssStyle;
};
