import { useState } from "react";
import {
  FILTER_OPERATOR,
  NUMBER_FILTER_OPERATOR,
  STRING_FILTER_OPERATOR,
  TStringFilterOperator,
  TableFilterRemoveButton,
  useTableFilterContext,
} from "./filter";
import { TColumnType, TTableColumn } from "./type";

type TPropsFilterForm = {
  cols: TTableColumn[];
};

export function TableFilterForm(props: TPropsFilterForm) {
  const { addFilter, removeFilter, filterConditions } = useTableFilterContext();
  const [selectingKey, setSelectingKey] = useState<string>("");
  const [selectingOperator, setSelectingOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [filterType, setFilterType] = useState<TColumnType>("string");

  return (
    <>
      <div className="flex flex-col gap-2">
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
                <option value={col.key}>{col.label}</option>
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
                <option value={op.key}>{op.label}</option>
              ))}
            {filterType === "number" &&
              NUMBER_FILTER_OPERATOR.map((op) => (
                <option value={op.key}>{op.label}</option>
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
              addFilter({
                key: selectingKey,
                operator: selectingOperator as TStringFilterOperator,
                value: [value],
              });
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
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-center">
          <TableFilterRemoveButton>remove all filter</TableFilterRemoveButton>
        </div>
      </div>
    </>
  );
}
