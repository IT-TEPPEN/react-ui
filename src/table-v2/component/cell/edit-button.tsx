"use client";

import { memo } from "react";
import { EditIcon } from "../../../icon/edit-icon";
import { useTablePropertyContext } from "../table/provider";

export const EditButton = memo(function EB() {
  const ref = useTablePropertyContext();

  return (
    <button
      className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
      onClick={(e) => {
        e.preventDefault();
        ref.switchToEditMode();
      }}
    >
      <EditIcon size={12} />
    </button>
  );
});
