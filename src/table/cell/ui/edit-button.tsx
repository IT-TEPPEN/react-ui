"use client";

import { memo } from "react";
import { useEditActionContext } from "../../edit/provider";
import { EditIcon } from "../../../icon/edit-icon";

const EditButton = memo(function EB() {
  const { startEditing } = useEditActionContext();

  return (
    <button
      className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
      onClick={(e) => {
        e.preventDefault();
        startEditing();
      }}
    >
      <EditIcon size={12} />
    </button>
  );
});

export default EditButton;
