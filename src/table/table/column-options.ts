import { DataRecord, TTableColumn } from "./type";

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

/** Whether the column can be sorted. */
export function isSortable<T extends DataRecord>(col: TTableColumn<T>) {
  return rendersOwnContent(col) ? col.disableSort === false : !col.disableSort;
}

/** Whether the column can be filtered (and is searched by "all columns"). */
export function isFilterable<T extends DataRecord>(col: TTableColumn<T>) {
  return rendersOwnContent(col)
    ? col.disableFilter === false
    : !col.disableFilter;
}
