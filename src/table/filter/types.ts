import { DataObject } from "../type";
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

type TStringFilter = {
  key: string;
  operator: TStringFilterOperator;
  value: string[];
  label?: string;
};

type TNumberFilter = {
  key: string;
  operator: TNumberFilterOperator;
  value: number;
  label?: string;
};

type TSelectFilter = {
  key: string;
  operator: TSelectFilterOperator;
  value: string;
  label?: string;
};

export type TFilter = TStringFilter | TNumberFilter | TSelectFilter;

type TFilterState = {
  filters: ({ id: number } & TFilter)[];
};

type TFilterAction =
  | { type: "add"; payload: { filter: TFilter } }
  | { type: "remove"; payload: { id: number } }
  | { type: "clear" };

export type TFilterReducer = (
  state: TFilterState,
  action: TFilterAction
) => TFilterState;

export type TReturnUseFilterReducer = {
  addFilter: (filter: TFilter) => void;
  removeFilter: (id: number) => void;
  clearFilter: () => void;
  filter: (rows: DataObject[]) => DataObject[];
  filterConditions: ({
    id: number;
  } & TFilter)[];
};
