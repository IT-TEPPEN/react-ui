"use client";

import { useEffect, useRef } from "react";
import { useRowContext } from "../../sheet/providers";
import { useCell } from "../../hook";
import { useInView } from "react-intersection-observer";
import { EditButton } from "./edit-button";
import { StringCellInput } from "./string-input";
import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";

export function TableCell() {
  const {
    cell,
    isFocus,
    isEditing,
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  } = useCell();
  const row = useRowContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { inView, ref } = useInView({
    root: document.querySelector("#table-frame"),
    rootMargin: "-60px -30px -30px -30px",
    threshold: 1,
  });

  useEffect(() => {
    if (isFocus && !inView) {
      if (scrollRef.current) {
        scrollRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [isFocus, inView, scrollRef]);

  return (
    <td
      ref={ref}
      className={`${
        isFocus ? "outline outline-1 -outline-offset-1 outline-gray-400" : ""
      }`}
    >
      <div ref={scrollRef} className={`relative`}>
        <div
          className={`flex items-center gap-3 w-fit p-2 cursor-default ${
            isFocus && isEditing ? "opacity-0" : ""
          }`}
          onClick={onClickCellToFocus}
        >
          {!!cell.render ? (
            cell.render(cell.value, row)
          ) : (
            <div onDoubleClick={onDoubleClickCellToEdit}>
              <p className="text-left whitespace-nowrap">{cell.label}</p>
            </div>
          )}

          {cell.editable && <EditButton />}
        </div>

        {cell.editable && isFocus && isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={preventPropagation}
          >
            {cell.type === "string" && <StringCellInput />}
            {cell.type === "number" && <NumberCellInput />}
            {cell.type === "select" && <SelectCellInput />}
          </div>
        )}
      </div>
    </td>
  );
}
