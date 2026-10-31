"use client";

import { useTable } from "./hook";
import { TableHeaderElement } from "../header/header";
import {
  DataRecord,
  TConditionalFormatting,
  TPropsTable,
  TTableColumn,
} from "./type";
import { PagenationProvider, DisplayRange, Pagenation } from "../pagenation";
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
import { RangeProvider, TestRange } from "../range/provider";
import { CopyProvider } from "../copy/provider";
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
import { useState } from "react";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
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

  return (
    <LocaleProvider locale={props.locale}>
      <ComponentProvider>
        <TableIdGeneratorProvider id={props.id}>
          <ColumnsWidthProvider cols={props.cols as TTableColumn<DataRecord>[]}>
            <FilterProvider
              initialConditions={initialFilters}
              initialMode={props.initialCondition?.filterMode}
            >
              <SortProvider initialCondition={props.initialCondition?.sort}>
                <PagenationProvider
                  rowCount={props.rows.length}
                  perPage={
                    (
                      props.initialCondition?.pagination ??
                      props.initialCondition?.pagenation
                    )?.rowCountPerPage
                  }
                >
                  <CheckboxProvider checkbox={props.checkbox}>
                    <CheckboxStatusProvider checkboxCount={props.rows.length}>
                      <ColumnsProvider
                        cols={props.cols}
                        errorHandler={props.errorHandler}
                      >
                        <EditProvider>
                          <TablePropertyProvider>
                            <RangeProvider>
                              <CopyProvider rows={props.rows} cols={props.cols}>
                                <CopiedMessage />
                                <PasteProvider
                                  rows={props.rows}
                                  cols={props.cols}
                                  onUpdateRowFunction={props.onUpdateRow}
                                  onPasteError={props.onPasteError}
                                >
                                  <KeyboardSetting
                                    enableDeprecatedCopy={
                                      props.deprecatedOptions
                                        ?.enableDeprecatedCopy
                                    }
                                  />
                                  <ScrollXPositionProvider>
                                    <BaseTable {...props} />
                                  </ScrollXPositionProvider>
                                </PasteProvider>
                              </CopyProvider>
                            </RangeProvider>
                          </TablePropertyProvider>
                        </EditProvider>
                      </ColumnsProvider>
                    </CheckboxStatusProvider>
                  </CheckboxProvider>
                </PagenationProvider>
              </SortProvider>
            </FilterProvider>
          </ColumnsWidthProvider>
        </TableIdGeneratorProvider>
      </ComponentProvider>
    </LocaleProvider>
  );
}

function BaseTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { cols, rowMaps, pageRowIds } = useTable<T>(props);
  const messages = useMessages();
  const { conditions } = useFilterState();
  const emptyMessage = props.loading
    ? messages.loading
    : props.rows.length > 0 && conditions.length > 0
    ? messages.noMatch
    : props.noDataMessage ?? messages.noData;
  const IdGenerator = useTableIdGenerator();
  const generateSortButton = useGenerateSortButton();

  return (
    <div className="w-full max-w-full max-h-full">
      <div>
        <TableHeader
          cols={cols}
          checkbox={!!props.checkbox}
          rows={props.rows}
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
                  className="absolute inset-0 z-20 grid place-items-center bg-white/60 rounded-b-md"
                  role="status"
                >
                  <p className="px-3 py-1 rounded bg-white font-bold shadow">
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
                    cols={props.cols as TTableColumn<DataRecord>[]}
                    onClickRow={props.onClickRow}
                    applyRowFormatting={props.applyRowFormatting}
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
          </Frame>
        </SelectBoxProvider>
      </div>
      <div className="mt-1">
        <DisplayRange />
        <div className="mt-2">
          <Pagenation />
        </div>
      </div>
    </div>
  );
}
