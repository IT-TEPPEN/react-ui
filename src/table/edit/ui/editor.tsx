import { useEffect, useState } from "react";
import {
  useColumnsContext,
  useValidationErrorSink,
} from "../../sheet/providers";
import { useEditActionContext, useEditStateContext } from "../provider";
import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";
import { StringCellInput } from "./string-input";
import { DataObject, DataRecord, TTableColumn } from "../../table/type";
import { useRangeStateContext } from "../../range/provider";
import { useTableIdGenerator } from "../../id";
import { useScrollXPosition } from "../../header/x-scroll-position";
import { measureCell, TBox } from "../../range/measure";
import { useMessages } from "../../locale/provider";
import { IIndex } from "../../range/type";

type TPropsEditor = {
  pageRowIds: (string | number)[];
  rowMaps: {
    [id: string]: {
      data: DataObject<DataRecord>;
    };
    [id: number]: {
      data: DataObject<DataRecord>;
    };
  };
};

/** Room needed under the cell for the hint; otherwise it goes above. */
const HINT_ROOM = 36;

export function Editor(props: TPropsEditor) {
  const IdGenerator = useTableIdGenerator();
  const range = useRangeStateContext();
  const edit = useEditStateContext();
  const editActions = useEditActionContext();
  const cols = useColumnsContext();
  // Re-measure while scrolling sideways: pinned cells stay put.
  useScrollXPosition();

  useEffect(() => {
    if (range.isSelecting && !cols[range.start.colIndex].editable) {
      editActions.endEditing();
    }
  }, [edit, range]);

  if (!edit.isEditing) return <></>;
  if (!range.isSelecting) return <></>;

  const col = cols[range.start.colIndex];
  const row = props.rowMaps[props.pageRowIds[range.start.rowIndex]].data;

  if (!col.editable) return <></>;

  const cell = {
    rowIndex: range.start.rowIndex,
    colIndex: range.start.colIndex,
  };
  const box = measureCell(IdGenerator, cell);
  if (!box) return <></>;

  // Put the hint (and the options of a select) above the cell when there is
  // no room for it under the cell in the visible part of the table.
  const scrollElement = document.getElementById(IdGenerator.getTableId());
  const roomBelow = scrollElement
    ? scrollElement.scrollTop +
      scrollElement.clientHeight -
      (box.top + box.height)
    : Infinity;
  const roomAbove = scrollElement ? box.top - scrollElement.scrollTop : 0;
  const placeAbove = roomBelow < HINT_ROOM && roomAbove > roomBelow;

  return (
    <CellEditor
      // A new editor (and no old error) for each cell.
      key={`${String(row.id)}:${String(col.key)}`}
      col={col}
      row={row}
      cell={cell}
      box={box}
      placeAbove={placeAbove}
      roomBelow={roomBelow}
      roomAbove={roomAbove}
    />
  );
}

function CellEditor(props: {
  col: TTableColumn<DataRecord>;
  row: DataObject<DataRecord>;
  cell: IIndex;
  box: TBox;
  placeAbove: boolean;
  roomBelow: number;
  roomAbove: number;
}) {
  const messages = useMessages();
  // null: no error. [] : invalid, already shown by the app's errorHandler.
  const [error, setError] = useState<string[] | null>(null);

  useValidationErrorSink((errors) =>
    setError(errors.slice(0, 1).map((e) => messages.validationShort(e)))
  );
  const clearError = () => setError(null);

  const { col, row, cell, box } = props;
  const invalid = error !== null;

  const frame = invalid
    ? "var(--teppen-table-error,#c4312b)"
    : "var(--teppen-table-editing-border,#2459d6)";

  return (
    <div
      data-teppen-part="editor"
      data-invalid={invalid ? "" : undefined}
      className="absolute z-10 bg-[color:var(--teppen-table-bg,#ffffff)]"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        ...box,
        boxShadow: `inset 0 0 0 2px ${frame}`,
        backgroundImage: invalid
          ? "linear-gradient(var(--teppen-table-error-bg,rgb(196 49 43 / 0.06)), var(--teppen-table-error-bg,rgb(196 49 43 / 0.06)))"
          : undefined,
      }}
    >
      {col.type === "string" && (
        <StringCellInput
          col={col}
          row={row}
          cell={cell}
          onChangeValue={clearError}
        />
      )}
      {col.type === "number" && (
        <NumberCellInput
          col={col}
          row={row}
          cell={cell}
          onChangeValue={clearError}
        />
      )}
      {col.type === "select" && (
        <SelectCellInput
          col={col}
          row={row}
          cell={cell}
          openAbove={props.roomBelow < 200 && props.roomAbove > props.roomBelow}
        />
      )}

      {col.type !== "select" && (
        <EditorNote placeAbove={props.placeAbove} invalid={invalid}>
          {invalid ? (
            <>
              {error[0] && <span>{error[0]}</span>}
              <span>
                <kbd className="font-bold [font-family:inherit]">Esc</kbd>{" "}
                {messages.escapeToRevert}
              </span>
            </>
          ) : (
            <>
              <span>
                <kbd className="font-bold [font-family:inherit]">Enter</kbd>{" "}
                {messages.editHint.enter}
              </span>
              <span>
                <kbd className="font-bold [font-family:inherit]">Tab</kbd>{" "}
                {messages.editHint.tab}
              </span>
              <span>
                <kbd className="font-bold [font-family:inherit]">Esc</kbd>{" "}
                {messages.editHint.escape}
              </span>
            </>
          )}
        </EditorNote>
      )}
    </div>
  );
}

/** The line under (or above) the cell being edited: keys, or the error. */
function EditorNote(props: {
  placeAbove: boolean;
  invalid: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-teppen-part={props.invalid ? "edit-error" : "edit-hint"}
      role={props.invalid ? "alert" : undefined}
      className={`absolute left-0 z-20 flex gap-3 whitespace-nowrap rounded-md px-2 py-1 text-xs leading-snug shadow pointer-events-none ${
        props.invalid
          ? "bg-[color:var(--teppen-table-error,#c4312b)] text-[color:var(--teppen-table-error-text,#ffffff)]"
          : "bg-[color:var(--teppen-table-hint-bg,#111827)] text-[color:var(--teppen-table-hint-text,#ffffff)]"
      }`}
      style={
        props.placeAbove
          ? { bottom: "calc(100% + 4px)" }
          : { top: "calc(100% + 4px)" }
      }
    >
      {props.children}
    </div>
  );
}
