"use client";

import { useCellContext } from "../../sheet/providers";
import { useCell } from "../../hook";
import { EditButton } from "./edit-button";
import { StringCellInput } from "./string-input";
import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";
import { useScrollAtFocusCell } from "../hook/scroll-at-focus-cell";
import React, { memo, useMemo } from "react";
import { TColumnType } from "../../type";

const CellData = memo(function CD(props: {
  type: TColumnType | "component";
  onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  component?: React.ReactNode;
}) {
  return (
    <>
      {props.type === "component" ? (
        props.component
      ) : (
        <div onDoubleClick={props.onDoubleClick}>
          <p className="text-left whitespace-nowrap">{props.component}</p>
        </div>
      )}
    </>
  );
});

const WithEdit = memo(function WE(props: {
  editable?: boolean;
  children: JSX.Element;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className={`flex items-center gap-3 w-fit p-2 cursor-default`}
      onClick={props.onClick}
    >
      {props.children}
      {props.editable && <EditButton />}
    </div>
  );
});

const WithEditor = memo(function WE(props: {
  isFocus: boolean;
  isEditing: boolean;
  editable?: boolean;
  type: TColumnType | "component";
  component: React.ReactNode;
  onClickCellToFocus: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement>;
  preventPropagation: React.MouseEventHandler<HTMLDivElement>;
}) {
  const { ref, scrollRef } = useScrollAtFocusCell(props.isFocus);

  const CellDataComponent = useMemo(
    () => (
      <CellData
        type={props.type}
        component={props.component}
        onDoubleClick={props.onDoubleClickCellToEdit}
      />
    ),
    [props.type, props.component, props.onDoubleClickCellToEdit]
  );

  return (
    <td
      ref={ref}
      className={`${
        props.isFocus
          ? "outline outline-1 -outline-offset-1 outline-gray-400"
          : ""
      }`}
    >
      <div ref={scrollRef} className={`relative`}>
        <div
          className={`${props.isFocus && props.isEditing ? "opacity-0" : ""}`}
        >
          <WithEdit
            editable={props.editable}
            onClick={props.onClickCellToFocus}
          >
            {CellDataComponent}
          </WithEdit>
        </div>

        {props.editable && props.isFocus && props.isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={props.preventPropagation}
          >
            {props.type === "string" && <StringCellInput />}
            {props.type === "number" && <NumberCellInput />}
            {props.type === "select" && <SelectCellInput />}
          </div>
        )}
      </div>
    </td>
  );
});

export function TableCell() {
  const {
    cell,
    isEditing,
    isFocus,
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  } = useCell();

  return (
    <WithEditor
      isFocus={isFocus}
      isEditing={isEditing}
      editable={cell.editable}
      type={cell.type}
      component={cell.component}
      onClickCellToFocus={onClickCellToFocus}
      onDoubleClickCellToEdit={onDoubleClickCellToEdit}
      preventPropagation={preventPropagation}
    />
  );
}
