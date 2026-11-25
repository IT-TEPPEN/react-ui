"use client";

import { useTable } from "./hook";
import { TableHeaderElement } from "../header/header";
import {
  DataRecord,
  TConditionalFormatting,
  TPropsTable,
  TTableColumn,
} from "./type";
import {
  PagenationProvider,
  DisplayRange,
  Pagenation,
  PageStepper,
  RowsPerPageSelect,
} from "../pagenation";
import { FilterProvider } from "../filter-v2";
import { SortProvider } from "../sort";
import { ColumnsProvider } from "../sheet/providers";
import { CheckboxProvider, CheckboxStatusProvider } from "../checkbox/provider";
import { EditProvider } from "../edit/provider";
import { TablePropertyProvider } from "../table-property/provider";
import { KeyboardSetting } from "../operation/components/keyboard-setting";
import { KeyCatcher } from "../operation/components/key-catcher";
import { Row } from "../sheet/components";
import { PasteProvider } from "../paste/provider";
import { generateFormattingString } from "../libs/conditional-formatting";
import { Editor } from "../edit/ui/editor";
import { EditFeedback, EditFeedbackProvider } from "../edit/feedback";
import { RangeProvider, TestRange } from "../range/provider";
import { CopyProvider } from "../copy/provider";
import { ShownRowsProvider } from "../shown-rows/provider";
import { CopiedMessage } from "../copy/components";
import { TableIdGeneratorProvider, useTableIdGenerator } from "../id";
import { TableHeader } from "../header/header-v2";
import {
  ColumnsWidthProvider,
  ColumnsWidthStyle,
  ScrollXPositionProvider,
} from "../header";
import { Frame } from "../frame";
import { ComponentProvider } from "./component-provider";
import { useGenerateSortButton } from "./component-provider/provider";
import { SelectBoxProvider } from "../../select-box/provider";
import { LocaleProvider, useMessages } from "../locale/provider";
import { useFilterState } from "../filter-v2/context";
import { MESSAGES } from "../locale/messages";
import { toCondition } from "../filter-v2/public";
import { Condition } from "../../search-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStableCallback, useStableColumns } from "./stable-columns";
import {
  ColumnSelector,
  ColumnVisibilityProvider,
  useColumnVisibility,
  useColumnVisibilityState,
  visibleColumns,
} from "../column-visibility";
import { useRangeActionContext } from "../range/provider";
import { useShowFirstRow } from "../pagenation/use-show-first-row";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
  const pagination =
    props.initialCondition?.pagination ?? props.initialCondition?.pagenation;

  // Filters from initialCondition, converted once on the first render.
  const [initialFilters] = useState(() =>
    (props.initialCondition?.filters ?? [])
      .map((filter) =>
        toCondition(
          filter,
          props.cols,
          MESSAGES[props.locale ?? "ja"].allColumns
        )
      )
      .filter((condition): condition is Condition => condition !== null)
  );

  // Columns the user hid are left out of everything that is shown, copied
  // or pasted; sorting and filtering still use every column.
  const visibility = useColumnVisibilityState(
    props.initialCondition?.hiddenColumns
  );
  // The same columns while they look the same, so cols defined inline do
  // not redraw every cell on each render of the app.
  const stableCols = useStableColumns(props.cols);
  const cols = useMemo(
    () => visibleColumns(stableCols, visibility.hiddenKeys),
    [stableCols, visibility.hiddenKeys]
  );

  // Inside, the table handles rows without knowing their own type, so the
  // app's row callbacks are passed on as callbacks for any row.
  const untyped = props as unknown as TPropsTable<DataRecord>;

  // The checkboxes get a checkbox object that stays the same; whether a row
  // is checked is worked out from the latest one (see useTable).
  const onChecked = useStableCallback(untyped.checkbox?.onChecked);
  const onUnchecked = useStableCallback(untyped.checkbox?.onUnchecked);
  const isChecked = useStableCallback(untyped.checkbox?.checked);
  const selectAll = untyped.checkbox?.selectAll;
  const checkbox = useMemo(
    () =>
      onChecked && onUnchecked && isChecked
        ? { checked: isChecked, onChecked, onUnchecked, selectAll }
        : undefined,
    [onChecked, onUnchecked, isChecked, selectAll]
  );

  return (
    <LocaleProvider locale={props.locale}>
      <ColumnVisibilityProvider value={visibility}>
        <ComponentProvider>
          <TableIdGeneratorProvider id={props.id}>
            <ColumnsWidthProvider
              cols={cols as TTableColumn<DataRecord>[]}
              initialWidths={props.initialCondition?.columnWidths}
              checkbox={!!props.checkbox}
            >
              <FilterProvider
                initialConditions={initialFilters}
                initialMode={props.initialCondition?.filterMode}
              >
                <SortProvider
                  initialSorts={
                    props.initialCondition?.sorts ??
                    (props.initialCondition?.sort
                      ? [props.initialCondition.sort]
                      : [])
                  }
                >
                  <PagenationProvider
                    rowCount={props.rows.length}
                    perPage={pagination?.rowCountPerPage}
                    currentPage={pagination?.page}
                  >
                    <CheckboxProvider checkbox={checkbox}>
                      <CheckboxStatusProvider>
                        <ColumnsProvider
                          cols={cols}
                          errorHandler={props.errorHandler}
                        >
                          <EditFeedbackProvider>
                            <EditProvider>
                              <TablePropertyProvider>
                                <RangeProvider>
                                  <ShownRowsProvider>
                                    <CopyProvider>
                                      <CopiedMessage />
                                      <PasteProvider
                                        onUpdateRowFunction={
                                          untyped.onUpdateRow
                                        }
                                        onPasteError={props.onPasteError}
                                      >
                                        <KeyboardSetting
                                          enableDeprecatedCopy={
                                            props.deprecatedOptions
                                              ?.enableDeprecatedCopy
                                          }
                                        />
                                        <ScrollXPositionProvider>
                                          <BaseTable
                                            {...props}
                                            cols={stableCols}
                                            visibleCols={cols}
                                          />
                                        </ScrollXPositionProvider>
                                      </PasteProvider>
                                    </CopyProvider>
                                  </ShownRowsProvider>
                                </RangeProvider>
                              </TablePropertyProvider>
                            </EditProvider>
                          </EditFeedbackProvider>
                        </ColumnsProvider>
                      </CheckboxStatusProvider>
                    </CheckboxProvider>
                  </PagenationProvider>
                </SortProvider>
              </FilterProvider>
            </ColumnsWidthProvider>
          </TableIdGeneratorProvider>
        </ComponentProvider>
      </ColumnVisibilityProvider>
    </LocaleProvider>
  );
}

function BaseTable<T extends DataRecord>(
  props: TPropsTable<T> & { visibleCols: TTableColumn<T>[] }
) {
  const { cols, rowMaps, pageRowIds, selectAllRows } = useTable<T>(
    props,
    props.visibleCols
  );
  const untyped = props as unknown as TPropsTable<DataRecord>;
  // Only called on a click, so a new function need not redraw the rows.
  const onClickRow = useStableCallback(untyped.onClickRow);
  const { hiddenKeys } = useColumnVisibility();
  const { reset: resetRange } = useRangeActionContext();

  // The selected cells move to other columns when columns are shown or
  // hidden, so the selection is cleared.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    resetRange();
  }, [hiddenKeys]);
  const messages = useMessages();
  const { conditions } = useFilterState();
  const emptyMessage = props.loading
    ? messages.loading
    : props.rows.length > 0 && conditions.length > 0
      ? messages.noMatch
      : (props.noDataMessage ?? messages.noData);
  const IdGenerator = useTableIdGenerator();
  const generateSortButton = useGenerateSortButton();
  useShowFirstRow(IdGenerator.getTableId());

  return (
    <div
      data-teppen-part="table"
      className={`w-full max-w-full max-h-full text-[color:var(--teppen-table-text,inherit)] ${
        props.className ?? ""
      }`}
      style={props.style}
    >
      <div>
        <TableHeader
          cols={cols}
          filterCols={props.cols}
          columnSelector={
            props.columnSelector ? (
              <ColumnSelector cols={props.cols} />
            ) : undefined
          }
          pageStepper={
            props.paginationPosition === "bottom" ? undefined : <PageStepper />
          }
          checkbox={!!props.checkbox}
          rows={selectAllRows}
          maxWidth={props.maxWidth}
          generateSortButton={generateSortButton}
        />

        <ColumnsWidthStyle scopeId={IdGenerator.getTableId()} />
        <SelectBoxProvider>
          <Frame
            overlay={
              props.loading && pageRowIds.length > 0 ? (
                // Rows stay visible (e.g. while reloading) under a light veil.
                <div
                  className="absolute inset-0 z-20 grid place-items-center bg-[color:var(--teppen-table-loading-veil,rgb(255_255_255/0.6))] rounded-b-[var(--teppen-table-radius,0.375rem)]"
                  role="status"
                >
                  <p className="px-3 py-1 rounded bg-[color:var(--teppen-table-bg,#ffffff)] font-bold shadow">
                    {messages.loading}
                  </p>
                </div>
              ) : undefined
            }
            id={IdGenerator.getTableId()}
            maxHeight={props.maxHeight}
            maxWidth={props.maxWidth}
            displayScroll={false}
          >
            <table className={`table`}>
              <thead>
                <tr>
                  {props.checkbox && <th className="p-px"></th>}
                  {cols.map((col) => (
                    <TableHeaderElement
                      key={col.key.toString()}
                      keyname={col.key.toString()}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRowIds.length === 0 && (
                  <tr>
                    <td
                      colSpan={cols.length + (props.checkbox ? 1 : 0)}
                      className="px-px py-5"
                    >
                      <div
                        className="text-center font-bold text-lg"
                        role={props.loading ? "status" : undefined}
                      >
                        {emptyMessage}
                      </div>
                    </td>
                  </tr>
                )}
                {pageRowIds.map((rowId, i) => (
                  <Row
                    key={rowId}
                    existCheckbox={!!props.checkbox}
                    rowIndex={i}
                    row={rowMaps[rowId].data}
                    cols={cols as TTableColumn<DataRecord>[]}
                    onClickRow={onClickRow}
                    applyRowFormatting={untyped.applyRowFormatting}
                    conditionalFormattingString={generateFormattingString(
                      rowMaps[rowId].data,
                      cols as TTableColumn<DataRecord>[],
                      props.conditionalFormattings as TConditionalFormatting<DataRecord>[]
                    )}
                  />
                ))}
              </tbody>
            </table>
            <TestRange />
            <KeyCatcher />
            <Editor rowMaps={rowMaps} pageRowIds={pageRowIds} />
            <EditFeedback />
          </Frame>
        </SelectBoxProvider>
      </div>
      <div className="mt-1">
        {props.rowCountPerPageOptions &&
        props.rowCountPerPageOptions.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <DisplayRange />
            <RowsPerPageSelect options={props.rowCountPerPageOptions} />
          </div>
        ) : (
          <DisplayRange />
        )}
        <div className="mt-2">
          <Pagenation />
        </div>
      </div>
    </div>
  );
}
