"use client";

import { memo } from "react";
import { useCellContext } from "../../sheet/providers";
import { useFocusContext } from "../../edit/provider";
import { EditIcon } from "../../edit-icon";

export const EditButton = memo(function EB() {
  const cell = useCellContext();
  const { focusAndEdit } = useFocusContext();

  return (
    <button
      className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
      onClick={(e) => {
        e.preventDefault();
        focusAndEdit(cell.rowIndex, cell.colIndex);
      }}
    >
      <EditIcon size={12} />
    </button>
  );
});
