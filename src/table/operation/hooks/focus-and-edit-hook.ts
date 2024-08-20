import { useCallback } from "react";
import { useEditActionContext } from "../../edit/provider";
import { useFocusActionContext } from "../../focus/provider";

export function useFocusAndEditAction() {
  const focusActions = useFocusActionContext();
  const editActions = useEditActionContext();

  const focusAndEdit = useCallback((rowIndex: number, colIndex: number) => {
    focusActions.focus(rowIndex, colIndex);
    editActions.startEditing();
  }, []);

  return focusAndEdit;
}
