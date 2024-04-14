"use client";

import { FIlterIcon } from "./filter-icon";
import { useFilterContext } from "./provider";
import { useEffect, useState } from "react";
import { DataObject, TColumnType, TTableColumn } from "../type";
import { CancelIcon } from "../cancel-icon";
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

type TPropsTableFilter = {
  keyName: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

export function TableFilter(props: TPropsTableFilter) {
  const { filterConditions } = useFilterContext();

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

type TPropsFilterForm<T extends DataObject> = {
  cols: TTableColumn<T>[];
};

export function TableFilterForm<T extends DataObject>(
  props: TPropsFilterForm<T>
) {
  const { addFilter, removeFilter, filterConditions } = useFilterContext();
  const [selectingKey, setSelectingKey] = useState<string>("");
  const [selectingOperator, setSelectingOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [filterType, setFilterType] = useState<TColumnType>("string");

  const filterColumn = props.cols.find((col) => col.key === selectingKey)!;

  useEffect(() => {
    setValue("");
    setSelectingOperator("");
  }, [selectingKey]);

  return (
    <>
      <div className="flex flex-col gap-2 mb-5">
        <p className="font-bold text-lg">フィルタ追加</p>
        <div className="flex flex-wrap gap-1">
          <select
            value={selectingKey}
            onChange={(e) => {
              e.preventDefault();
              setSelectingKey(e.target.value);
              const columnType = props.cols.find(
                (col) => col.key === e.target.value
              )?.type as TColumnType;
              setFilterType(columnType);
            }}
          >
            <option value="">-- 列を選択 --</option>
            {props.cols
              .filter((col) => !!col.label && !!col.type)
              .map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
          </select>
          <select
            value={selectingOperator}
            onChange={(e) => {
              e.preventDefault();
              setSelectingOperator(e.target.value);
            }}
            disabled={!selectingKey}
          >
            <option value="">
              {selectingKey ? "-- 条件を選択 --" : "-- 列を選択してください --"}
            </option>
            {filterType === "string" &&
              STRING_FILTER_OPERATOR.map((op) => (
                <option key={op.key} value={op.key}>
                  {op.label}
                </option>
              ))}
            {filterType === "number" &&
              NUMBER_FILTER_OPERATOR.map((op) => (
                <option key={op.key} value={op.key}>
                  {op.label}
                </option>
              ))}
            {filterType === "select" &&
              SELECT_FILTER_OPERATOR.map((op) => (
                <option key={op.key} value={op.key}>
                  {op.label}
                </option>
              ))}
          </select>
          {filterType === "select" ? (
            <select
              value={value}
              onChange={(e) => {
                e.preventDefault();
                setValue(e.target.value);
              }}
            >
              <option value="">-- 未選択 --</option>
              {filterColumn.type === "select" &&
                filterColumn.options.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => {
                e.preventDefault();
                setValue(e.target.value);
              }}
              placeholder="-- 値を入力 --"
            />
          )}
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-900 text-white py-1 px-2 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              if (
                !selectingKey ||
                !selectingOperator ||
                (filterColumn.type !== "select" && !value)
              ) {
                alert("全ての項目を入力してください");
                return;
              }

              const addFilterColumn = props.cols.find(
                (col) => col.key === selectingKey
              )!;

              addFilter(
                filterType === "string"
                  ? {
                      key: selectingKey,
                      operator: selectingOperator as TStringFilterOperator,
                      value: [value],
                    }
                  : filterType === "select"
                  ? {
                      key: selectingKey,
                      operator: selectingOperator as TSelectFilterOperator,
                      value: value,
                      label:
                        addFilterColumn.type === "select"
                          ? addFilterColumn.options.find(
                              (op) => op.value === value
                            )?.label
                          : undefined,
                    }
                  : {
                      key: selectingKey,
                      operator: selectingOperator as TNumberFilterOperator,
                      value: Number(value),
                    }
              );
            }}
          >
            追加
          </button>
        </div>
      </div>
      <div>
        {filterConditions.length > 0 && (
          <p className="font-bold text-lg">フィルタ一覧</p>
        )}
        <ul className="flex flex-col gap-1 my-2">
          {filterConditions.map((f) => (
            <li key={f.id} className="flex justify-between">
              <p>
                「
                <strong>
                  {props.cols.find((col) => col.key === f.key)?.label}
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
          <TableFilterRemoveButton>
            <p className="text-gray-600 underline hover:text-gray-800">
              remove all filters
            </p>
          </TableFilterRemoveButton>
        </div>
      </div>
    </>
  );
}
