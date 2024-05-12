import { DataObject, DataRecord } from "../type";
import {
  NUMBER_FILTER_OPERATOR,
  SELECT_FILTER_OPERATOR,
  STRING_FILTER_OPERATOR,
} from "./constants";

export type TStringFilterOperator =
  (typeof STRING_FILTER_OPERATOR)[number]["key"];

export type TNumberFilterOperator =
  (typeof NUMBER_FILTER_OPERATOR)[number]["key"];

export type TSelectFilterOperator =
  (typeof SELECT_FILTER_OPERATOR)[number]["key"];

export type TFilterOperator =
  | TStringFilterOperator
  | TNumberFilterOperator
  | TSelectFilterOperator;

type TStringFilter<T extends DataRecord, U extends keyof T = string> = {
  key: U;
  operator: TStringFilterOperator;
  value: string[];
  label?: string;
};

type TNumberFilter<T extends DataRecord, U extends keyof T = string> = {
  key: U;
  operator: TNumberFilterOperator;
  value: number;
  label?: string;
};

type TSelectFilter<T extends DataRecord, U extends keyof T = string> = {
  key: U;
  operator: TSelectFilterOperator;
  value: string;
  label?: string;
};

export type TFilter<T extends DataRecord> =
  | TStringFilter<T>
  | TNumberFilter<T>
  | TSelectFilter<T>;

export type TFilterState<T extends DataRecord> = {
  filters: ({ id: number } & TFilter<T>)[];
};

export type TFilterAction<T extends DataRecord> =
  | { type: "add"; payload: { filter: TFilter<T> } }
  | { type: "remove"; payload: { id: number } }
  | { type: "clear" };

export type TFilterReducer<T extends DataRecord> = (
  state: TFilterState<T>,
  action: TFilterAction<T>
) => TFilterState<T>;

export type TReturnUseFilterReducer<T extends DataRecord> = {
  addFilter: <U extends DataRecord>(filter: TFilter<U>) => void;
  removeFilter: (id: number) => void;
  clearFilter: () => void;
  filter: <U extends DataRecord>(rows: DataObject<U>[]) => DataObject<U>[];
  filterConditions: ({
    id: number;
  } & TFilter<T>)[];
};
