import { useState } from "react";
import {
  FILTER_OPERATOR,
  NUMBER_FILTER_OPERATOR,
  STRING_FILTER_OPERATOR,
  TNumberFilterOperator,
  TStringFilterOperator,
  TableFilterRemoveButton,
  useTableFilterContext,
} from "./filter";
import { DataObject, TColumnType, TTableColumn } from "./type";
import { CancelIcon } from "./cancel-icon";

type TPropsFilterForm<T extends DataObject> = {
  cols: TTableColumn<T>[];
};

export function TableFilterForm<T extends DataObject>(
  props: TPropsFilterForm<T>
) {
  const { addFilter, removeFilter, filterConditions } = useTableFilterContext();
  const [selectingKey, setSelectingKey] = useState<string>("");
  const [selectingOperator, setSelectingOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [filterType, setFilterType] = useState<TColumnType>("string");

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
          </select>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              e.preventDefault();
              setValue(e.target.value);
            }}
            placeholder="-- 値を入力 --"
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-900 text-white py-1 px-2 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              if (!selectingKey || !selectingOperator || !value) {
                alert("全ての項目を入力してください");
                return;
              }
              addFilter(
                filterType === "string"
                  ? {
                      key: selectingKey,
                      operator: selectingOperator as TStringFilterOperator,
                      value: [value],
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
                ：<span>{f.value}</span>
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
