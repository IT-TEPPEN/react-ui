/**
 * Puts text into the cell editor (`id`) as if the user had typed it, so the
 * editor's onChange runs. Used when editing starts by typing on a cell.
 */
export function setEditorInitialValue(text: string, id: string) {
  const inputElement = document.getElementById(id);
  if (!(inputElement instanceof HTMLInputElement)) {
    return;
  }

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  nativeInputValueSetter?.call(inputElement, text);
  inputElement.dispatchEvent(new Event("input", { bubbles: true }));
}
