"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { useCheckboxContext, useCheckboxStatusContext } from "./provider";
import { DataObject, DataRecord } from "../table/type";

type TPropsCheckbox = {
  row: DataObject<DataRecord>;
};

export const Checkbox = memo(function CB(props: TPropsCheckbox) {
  const checkbox = useCheckboxContext();
  const { checkboxStatusState } = useCheckboxStatusContext();
  const row = props.row;

  const checkboxIds = useMemo(() => {
    return checkboxStatusState.checkedRecords.map((record) => record.id);
  }, [checkboxStatusState.checkedRecords]);

  if (!checkbox) return <></>;

  return (
    <div className="flex justify-center gap-1 w-full items-center">
      <input
        type="checkbox"
        checked={checkboxIds.includes(row.id)}
        onChange={(e) => {
          e.preventDefault();
          if (e.target.checked) {
            checkbox.onChecked(row);
          } else {
            checkbox.onUnchecked(row);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
});

export const AllCheckbox = memo(function ACB<T extends DataRecord>(props: {
  rows: DataObject<T>[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const checkbox = useCheckboxContext();
  const { checkboxStatusState, existChecked, indeterminate } =
    useCheckboxStatusContext();

  const checkboxIds = useMemo(() => {
    return checkboxStatusState.checkedRecords.map((record) => record.id);
  }, [checkboxStatusState.checkedRecords]);

  const uncheckLists = useMemo(() => {
    return props.rows.filter((row) => !checkboxIds.includes(row.id));
  }, [props.rows, checkboxIds]);

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    ref.current.indeterminate = indeterminate === true;
  }, [indeterminate]);

  if (!checkbox) return <></>;

  return (
    <div className="grid place-items-center w-full px-1">
      <input
        ref={ref}
        type="checkbox"
        checked={existChecked}
        onChange={(e) => {
          e.preventDefault();
          if (e.target.checked) {
            uncheckLists.forEach((row) => {
              checkbox.onChecked(row);
            });
          } else {
            checkboxStatusState.checkedRecords.forEach((row) => {
              checkbox.onUnchecked(row);
            });
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
});
