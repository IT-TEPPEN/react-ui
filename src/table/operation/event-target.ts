/**
 * Returns true when the event comes from an element where the user types
 * text (input, textarea, select or contenteditable). The table must not take
 * over keys or pastes aimed at such elements.
 */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** True while an IME (e.g. Japanese input) is composing text. */
export function isComposingKey(e: KeyboardEvent): boolean {
  return e.isComposing || e.keyCode === 229;
}
