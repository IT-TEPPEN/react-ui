import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../../table/base";

beforeAll(() => {
  // jsdom does not implement scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

const editor = () =>
  document.getElementById("ReactUI:Table:E:Editor") as HTMLInputElement | null;

function openEditor() {
  const onCellBlur = jest.fn((_k, _v, _row, completeEditing) =>
    completeEditing()
  );
  render(
    <Table
      id="E"
      rows={[{ id: "1", name: "a" }]}
      cols={[
        { key: "name", type: "string", label: "名前", editable: true, onCellBlur },
      ]}
    />
  );

  const cell = document.getElementById("ReactUI:Table:E:Cell-0-0")!;
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
  act(() => {
    fireEvent.keyDown(document.body, { key: "F2" });
  });

  const input = editor()!;
  fireEvent.change(input, { target: { value: "日本" } });
  return { input, onCellBlur };
}

// What a browser sends for a key that confirms or cancels IME conversion:
// a keydown while composing, then a keyup after composition has ended.
function imeKey(input: HTMLInputElement, key: string) {
  act(() => {
    fireEvent.keyDown(input, { key, isComposing: true, keyCode: 229 });
    fireEvent.keyDown(document.body, { key, isComposing: true, keyCode: 229 });
    fireEvent.keyUp(input, { key });
  });
}

function plainKey(input: HTMLInputElement, key: string) {
  act(() => {
    fireEvent.keyDown(input, { key });
    fireEvent.keyUp(input, { key });
  });
}

describe("cell editor keys", () => {
  test("Enter that confirms IME conversion does not finish editing", () => {
    const { input, onCellBlur } = openEditor();

    imeKey(input, "Enter");
    expect(onCellBlur).not.toHaveBeenCalled();
    expect(editor()).not.toBeNull();

    plainKey(input, "Enter");
    expect(onCellBlur).toHaveBeenCalledTimes(1);
    expect(onCellBlur.mock.calls[0][1]).toBe("日本");
    expect(editor()).toBeNull();
  });

  test("Escape that cancels IME conversion does not close the editor", () => {
    const { input, onCellBlur } = openEditor();

    imeKey(input, "Escape");
    expect(editor()).not.toBeNull();

    plainKey(input, "Escape");
    expect(editor()).toBeNull();
    expect(onCellBlur).not.toHaveBeenCalled();
  });
});
