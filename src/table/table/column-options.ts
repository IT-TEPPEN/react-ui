import { DataObject, DataRecord, TTableColumn } from "./type";

/**
 * A read-only column that shows something of its own with render. What it
 * shows may have nothing to do with its value in rows (for example an id
 * that a component uses to load a name), so it is only sorted or filtered
 * when the app says so with `disableSort: false` / `disableFilter: false`.
 */
function rendersOwnContent<T extends DataRecord>(col: TTableColumn<T>) {
  return (
    !col.editable &&
    col.type !== "date" &&
    col.type !== "datetime" &&
    !!col.render
  );
}

/**
 * Whether the column can be sorted. A sortValue counts as opting in, as
 * `disableSort: false` does.
 */
export function isSortable<T extends DataRecord>(col: TTableColumn<T>) {
  if (col.disableSort === true) return false;
  return rendersOwnContent(col)
    ? col.disableSort === false || !!col.sortValue
    : true;
}

/**
 * Whether the column can be filtered (and is searched by "all columns"). A
 * filterValue counts as opting in, as `disableFilter: false` does.
 */
export function isFilterable<T extends DataRecord>(col: TTableColumn<T>) {
  if (col.disableFilter === true) return false;
  return rendersOwnContent(col)
    ? col.disableFilter === false || !!col.filterValue
    : true;
}

/** The value a column is filtered by: its filterValue, or its value in rows. */
export function filterValueOf<T extends DataRecord>(
  col: TTableColumn<T>,
  row: DataObject<T>
): unknown {
  return col.filterValue ? col.filterValue(row) : row[col.key];
}
