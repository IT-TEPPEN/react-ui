import { createContext, useCallback, useContext, useReducer } from "react";
import { DataObject } from "./type";
import { FIlterIcon } from "./filter-icon";

export const STRING_FILTER_OPERATOR = [
  { key: "includeText", label: "次の値を含む" },
] as const;

export const NUMBER_FILTER_OPERATOR = [
  { key: "eq", label: "次の値と等しい" },
  { key: "ne", label: "次の値と等しくない" },
  { key: "gt", label: "次の値より大きい" },
  { key: "lt", label: "次の値より小さい" },
  { key: "gte", label: "次の値以上" },
  { key: "lte", label: "次の値以下" },
] as const;

export const SELECT_FILTER_OPERATOR = [
  { key: "selected", label: "次の値と等しい" },
  { key: "notSelected", label: "次の値と等しくない" },
] as const;

export const FILTER_OPERATOR = [
  ...STRING_FILTER_OPERATOR,
  ...NUMBER_FILTER_OPERATOR,
  ...SELECT_FILTER_OPERATOR,
] as const;

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

type TFilter = TStringFilter | TNumberFilter | TSelectFilter;

type TFilterState = {
  filters: ({ id: number } & TFilter)[];
};

type TFilterAction =
  | { type: "add"; payload: { filter: TFilter } }
  | { type: "remove"; payload: { id: number } }
  | { type: "clear" };

export function filterReducer(
  state: TFilterState,
  action: TFilterAction
): TFilterState {
  switch (action.type) {
    case "add":
      return {
        filters: [
          ...state.filters,
          { id: new Date().getTime(), ...action.payload.filter },
        ],
      };
    case "remove":
      return {
        filters: state.filters.filter((f) => f.id !== action.payload.id),
      };
    case "clear":
      return { filters: [] };
  }
}

function useFilterReducer() {
  const [state, dispatch] = useReducer(filterReducer, { filters: [] });

  const addFilter = useCallback(
    (filter: TFilter) => dispatch({ type: "add", payload: { filter } }),
    [dispatch]
  );
  const removeFilter = useCallback(
    (id: number) => dispatch({ type: "remove", payload: { id } }),
    [dispatch]
  );
  const clearFilter = useCallback(
    () => dispatch({ type: "clear" }),
    [dispatch]
  );

  const filter = useCallback(
    <T extends DataObject>(rows: T[]): T[] => {
      return state.filters.reduce((acc, filter) => {
        switch (filter.operator) {
          case "includeText":
            return acc.filter((row) => {
              const value = row[filter.key];
              if (typeof value === "string") {
                return filter.value.some((v) => value.includes(v));
              }
              return false;
            });
          case "eq":
            return acc.filter((row) => row[filter.key] === filter.value);
          case "ne":
            return acc.filter((row) => row[filter.key] !== filter.value);
          case "gt":
            return acc.filter((row) => row[filter.key] > filter.value);
          case "lt":
            return acc.filter((row) => row[filter.key] < filter.value);
          case "gte":
            return acc.filter((row) => row[filter.key] >= filter.value);
          case "lte":
            return acc.filter((row) => row[filter.key] <= filter.value);
          case "selected":
            return acc.filter((row) => row[filter.key] === filter.value);
          case "notSelected":
            return acc.filter((row) => row[filter.key] !== filter.value);
        }
      }, rows);
    },
    [state]
  );

  return {
    addFilter,
    removeFilter,
    clearFilter,
    filter,
    filterConditions: state.filters,
  };
}

const TableFilterContext = createContext<ReturnType<typeof useFilterReducer>>({
  addFilter: () => {},
  removeFilter: () => {},
  clearFilter: () => {},
  filter: () => [],
  filterConditions: [],
});

export function TableFilterProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <TableFilterContext.Provider value={useFilterReducer()}>
      {children}
    </TableFilterContext.Provider>
  );
}

export function useTableFilterContext() {
  return useContext(TableFilterContext);
}

type TPropsTableFilter = {
  keyName: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

export function TableFilter(props: TPropsTableFilter) {
  const { filterConditions } = useTableFilterContext();

  return (
    <div className="relative cursor-pointer" onClick={props.onClick}>
      <FIlterIcon
        isFilterActive={
          filterConditions.filter((f) => f.key === props.keyName).length > 0
        }
      />
    </div>
  );
}

export function TableFilterRemoveButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clearFilter, filterConditions } = useTableFilterContext();

  if (filterConditions.length === 0) {
    return;
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        clearFilter();
      }}
    >
      {children}
    </button>
  );
}
