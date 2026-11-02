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
    <div className="grid place-items-center w-full h-full px-1">
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

/**
 * The checkbox in the header. It is checked when some of its rows (see
 * checkbox.selectAll) are checked, and shows a dash when only some are.
 * Clicking it checks all of its rows, or unchecks them when some are
 * checked. Rows outside of it are left as they are.
 */
export const AllCheckbox = memo(function ACB(props: {
  rows: DataObject<DataRecord>[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const checkbox = useCheckboxContext();
  const { checkboxStatusState } = useCheckboxStatusContext();

  const { checkedRows, uncheckedRows } = useMemo(() => {
    const checkedIds = new Set(
      checkboxStatusState.checkedRecords.map((record) => record.id)
    );
    return {
      checkedRows: props.rows.filter((row) => checkedIds.has(row.id)),
      uncheckedRows: props.rows.filter((row) => !checkedIds.has(row.id)),
    };
  }, [props.rows, checkboxStatusState.checkedRecords]);

  const someChecked = checkedRows.length > 0;
  const indeterminate = someChecked && uncheckedRows.length > 0;

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  if (!checkbox) return <></>;

  return (
    <div className="grid place-items-center w-full h-full px-1">
      <input
        ref={ref}
        type="checkbox"
        checked={someChecked}
        onChange={(e) => {
          e.preventDefault();
          if (e.target.checked) {
            uncheckedRows.forEach((row) => {
              checkbox.onChecked(row);
            });
          } else {
            checkedRows.forEach((row) => {
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
