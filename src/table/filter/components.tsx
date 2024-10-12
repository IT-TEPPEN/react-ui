"use client";

import { FIlterIcon } from "./filter-icon";
import { useFilterContext } from "./provider";
import React, { useCallback, useEffect, useState } from "react";
import { CancelIcon } from "../../icon/cancel-icon";
import {
  FILTER_OPERATOR,
  NUMBER_FILTER_OPERATOR,
  SELECT_FILTER_OPERATOR,
  STRING_FILTER_OPERATOR,
} from "./constants";
import {
  TNumberFilterOperator,
  TSelectFilterOperator,
  TStringFilterOperator,
} from "./types";
import { useColumnsContext } from "../sheet/providers";
import { DataRecord, TTableColumn } from "../type";
import {
  useFilteringColumnActionContext,
  useFilteringColumnStateContext,
} from "./hooks/selectedFilteringColumn/provider";

type TPropsTableFilter<T extends DataRecord> = {
  col: TTableColumn<T>;
};

export function TableFilter<T extends DataRecord>(props: TPropsTableFilter<T>) {
  const { filterConditions } = useFilterContext();
  const filteringColumn = useFilteringColumnStateContext();
  const { setFilteringColumn, clearFilteringColumn } =
    useFilteringColumnActionContext();

  return (
    <div
      className="relative cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        if (!filteringColumn) {
          setFilteringColumn(props.col as TTableColumn<DataRecord>);
          return;
        }

        if (filteringColumn.key === props.col.key) {
          clearFilteringColumn();
        } else {
          setFilteringColumn(props.col as TTableColumn<DataRecord>);
        }
      }}
    >
      <FIlterIcon
        isFilterTarget={
          !!filteringColumn && filteringColumn.key === props.col.key
        }
        isFilterActive={
          filterConditions.filter((f) => f.key === props.col.key).length > 0
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
  const { clearFilter, filterConditions } = useFilterContext();

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

export function TableSpecifyKeyFilterRemoveButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { removeFilter, filterConditions } = useFilterContext();
  const filteringColumn = useFilteringColumnStateContext();

  if (
    filteringColumn === null ||
    filterConditions.filter((f) => f.key === filteringColumn.key).length === 0
  ) {
    return;
  }

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    filterConditions
      .filter((f) => f.key === filteringColumn.key)
      .forEach((f) => {
        removeFilter(f.id);
      });
  };

  return <button onClick={onClick}>{children}</button>;
}

function SelectFilterType({
  value,
  onChange,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  const filteringColumn = useFilteringColumnStateContext();

  if (!filteringColumn) return <></>;

  return (
    <select value={value} onChange={onChange} className="px-2 py-1 rounded-md">
      <option value="">
        {filteringColumn.key
          ? "-- 条件を選択 --"
          : "-- 列を選択してください --"}
      </option>
      {filteringColumn.type === "string" &&
        STRING_FILTER_OPERATOR.map((op) => (
          <option key={op.key} value={op.key}>
            {op.label}
          </option>
        ))}
      {filteringColumn.type === "number" &&
        NUMBER_FILTER_OPERATOR.map((op) => (
          <option key={op.key} value={op.key}>
            {op.label}
          </option>
        ))}
      {filteringColumn.type === "select" &&
        SELECT_FILTER_OPERATOR.map((op) => (
          <option key={op.key} value={op.key}>
            {op.label}
          </option>
        ))}
    </select>
  );
}

function SelectOptions(props: {
  value: string;
  options: { value: string; label: string }[];
  setValue: (value: string) => void;
}) {
  return (
    <select
      className="w-full px-2 py-1 rounded-md min-w-32"
      value={props.value}
      onChange={(e) => {
        e.preventDefault();
        props.setValue(e.target.value);
      }}
    >
      <option value="">-- 未選択 --</option>
      {props.options.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  );
}

function InputString(props: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <input
      className="w-full px-2 py-1 rounded-md min-w-32"
      type="text"
      value={props.value}
      onChange={(e) => {
        e.preventDefault();
        props.setValue(e.target.value);
      }}
      placeholder="-- 値を入力 --"
    />
  );
}

function AddFilterButton(props: { value: string; selectingOperator: string }) {
  const { addFilter } = useFilterContext();
  const filteringColumn = useFilteringColumnStateContext();

  if (!filteringColumn) return <></>;

  return (
    <button
      className="bg-gray-900 text-white py-1 px-2 rounded-md text-nowrap"
      onClick={(e) => {
        e.preventDefault();
        if (
          !filteringColumn.key ||
          !props.selectingOperator ||
          (filteringColumn.type !== "select" && !props.value)
        ) {
          alert("全ての項目を入力してください");
          return;
        }

        addFilter(
          filteringColumn.type === "string"
            ? {
                key: filteringColumn.key,
                operator: props.selectingOperator as TStringFilterOperator,
                value: [props.value],
              }
            : filteringColumn.type === "select"
            ? {
                key: filteringColumn.key,
                operator: props.selectingOperator as TSelectFilterOperator,
                value: props.value,
                label: filteringColumn.options.find(
                  (op) => op.value === props.value
                )?.label,
              }
            : {
                key: filteringColumn.key,
                operator: props.selectingOperator as TNumberFilterOperator,
                value: Number(props.value),
              }
        );
      }}
    >
      追加
    </button>
  );
}

export function TableFilterForm() {
  const filteringColumn = useFilteringColumnStateContext();
  const { setFilteringColumn, clearFilteringColumn } =
    useFilteringColumnActionContext();
  const cols = useColumnsContext();
  const { removeFilter, filterConditions } = useFilterContext();
  const [selectingOperator, setSelectingOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue("");
    setSelectingOperator("");
  }, [filteringColumn]);

  if (!filteringColumn) return <></>;

  const onSelectingOperator: React.ChangeEventHandler<HTMLSelectElement> =
    useCallback((e) => {
      e.preventDefault;
      setSelectingOperator(e.target.value);
    }, []);

  return (
    <div className="flex w-full max-h-[50vh] bg-gray-200">
      <ul className="flex flex-col items-end min-w-16 md:w-[20%] max-h-full overflow-y-auto no_scrollbar bg-white">
        {cols
          .filter((col) => !!col.label && !col.disableFilter)
          .map((col) => (
            <li
              key={col.key}
              className={`relative pl-2 pr-8 md:px-8 py-3 w-full cursor-pointer border-y border-gray-300 ${
                filteringColumn.key === col.key
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setFilteringColumn(col);
              }}
            >
              <p
                className={`text-right text-nowrap ${
                  filteringColumn.key === col.key
                    ? "underline underline-offset-2 decoration-2 decoration-neutral-500"
                    : ""
                }`}
              >
                {col.label}
              </p>
              {filterConditions.filter((f) => f.key === col.key).length > 0 && (
                <div className="absolute top-1/2 right-1">
                  <div className="-translate-y-1/2 rounded-full border border-gray-400 bg-gray-100 aspect-square w-5">
                    <p className="text-xs text-center">
                      {filterConditions.filter((f) => f.key === col.key).length}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
      </ul>
      <div className="relative flex flex-col gap-4 ml-4 mr-4 md:ml-16 md:mr-auto py-5">
        <div className="absolute top-5 right-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              clearFilteringColumn();
            }}
          >
            閉じる
          </button>
        </div>
        <p className="font-bold text-xl">フィルタリング条件</p>
        <div className="flex items-center gap-3 max-w-6xl">
          <p className="text-gray-600 text-lg text-nowrap">
            「<strong>{filteringColumn.label}</strong>」 は
          </p>
          <SelectFilterType
            value={selectingOperator}
            onChange={onSelectingOperator}
          />
          {filteringColumn.type === "select" ? (
            <SelectOptions
              value={value}
              options={filteringColumn.options}
              setValue={setValue}
            />
          ) : (
            <InputString value={value} setValue={setValue} />
          )}
          <AddFilterButton
            value={value}
            selectingOperator={selectingOperator}
          />
        </div>

        <ul className="flex flex-col gap-1 my-5 max-h-32 overflow-auto">
          {filterConditions
            .filter((f) => f.key === filteringColumn.key)
            .map((f) => (
              <li key={f.id} className="flex justify-between mr-5">
                <p>
                  「
                  <strong>
                    {cols.find((col) => col.key === f.key)?.label}
                  </strong>
                  」 は
                  <span>
                    {FILTER_OPERATOR.find((op) => op.key === f.operator)?.label}
                  </span>
                  ：<span>{f.label ? f.label : f.value}</span>
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFilter(f.id);
                  }}
                >
                  <CancelIcon size={16} />
                </button>
              </li>
            ))}
        </ul>
        <div className="flex justify-center">
          <TableSpecifyKeyFilterRemoveButton>
            <p className="text-xs text-gray-600 underline hover:text-gray-800">
              「{filteringColumn.label}」のフィルタを全て解除
            </p>
          </TableSpecifyKeyFilterRemoveButton>
        </div>
      </div>
    </div>
  );
}
