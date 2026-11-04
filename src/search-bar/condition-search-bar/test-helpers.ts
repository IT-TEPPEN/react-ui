// Drives the search bar in tests: choose a column, set the panel, apply.
import { act, fireEvent, within } from "@testing-library/react";

const run = () =>
  act(() => {
    jest.runAllTimers();
  });

/** The box to type in (the column list opens from it). */
export const searchBox = (container: HTMLElement) =>
  container.querySelector(
    '[data-teppen-part="search-bar"] input[id$=":input-area"]'
  ) as HTMLInputElement;

export const optionsList = () =>
  document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement | null;

/** The options shown in the column list. */
export const shownOptions = () =>
  Array.from(optionsList()?.children ?? []).map((el) => el.textContent);

export const panel = () =>
  document.querySelector('[data-teppen-part="condition-panel"]') as HTMLElement | null;

/** Opens the column list and chooses `column` (its label). */
export function chooseColumn(container: HTMLElement, column: string) {
  fireEvent.click(searchBox(container));
  run();
  fireEvent.click(within(optionsList()!).getByText(column, { exact: true }));
  run();
}

/** Sets the open panel: the condition button, the value, the checked options. */
export function setPanel(options: { choice?: string; value?: string; checks?: string[] }) {
  const p = panel()!;
  if (options.choice) {
    fireEvent.click(
      within(p).getByRole("button", { name: options.choice })
    );
  }
  if (options.value !== undefined) {
    fireEvent.change(p.querySelector("[data-panel-value]")!, {
      target: { value: options.value },
    });
  }
  for (const label of options.checks ?? []) {
    fireEvent.click(within(p).getByLabelText(label));
  }
}

/** The panel's main button (追加 / 変更 / Add / Change). */
export function applyPanel() {
  const buttons = panel()!.querySelectorAll("button");
  fireEvent.click(buttons[buttons.length - 1]);
  run();
}

/** Adds a condition: column, then the panel. */
export function addCondition(
  container: HTMLElement,
  column: string,
  options: { choice?: string; value?: string; checks?: string[] } = {}
) {
  chooseColumn(container, column);
  setPanel(options);
  applyPanel();
}

/** The conditions as shown ("部署 が 営業部"). */
export const conditionTexts = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll('[data-teppen-part="condition"] > span')
  ).map((el) => el.textContent);
