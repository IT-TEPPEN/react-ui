import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { SelectBox, Options } from ".";

const options: Options[] = [
  { value: "", label: "-- 選択解除 --" },
  { value: "tokyo", label: "東京", searchText: "とうきょう tokyo" },
  { value: "osaka", label: "大阪", searchText: "おおさか osaka" },
  { value: "kyoto", label: "京都" },
];

beforeAll(() => {
  // jsdom does not implement scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

afterEach(cleanup);

function setup(initial = "") {
  const onSelect = jest.fn();

  function Wrapper() {
    const [value, setValue] = useState(initial);
    return (
      <>
        <SelectBox
          id="city"
          options={options}
          value={value}
          onSelect={(v) => {
            onSelect(v);
            setValue(v);
          }}
        />
        <button data-testid="outside">outside</button>
      </>
    );
  }

  const utils = render(<Wrapper />);
  const input = document.getElementById(
    "teppen:react-ui:select-box:city:input-area"
  ) as HTMLInputElement;
  const shownOptions = () =>
    Array.from(
      document.querySelectorAll('[id="ReactUI:SelectBox:OptionsArea"] > div')
    ).map((el) => el.textContent);
  const key = (k: string) =>
    act(() => {
      fireEvent.keyDown(document, { key: k });
    });

  return { ...utils, input, onSelect, shownOptions, key };
}

describe("SelectBox", () => {
  test("shows the label of the current value", () => {
    const { input } = setup("osaka");
    expect(input.value).toBe("大阪");
  });

  test("opens on click and lists every option", () => {
    const { input, shownOptions } = setup();
    expect(shownOptions()).toEqual([]);

    fireEvent.click(input);
    expect(shownOptions()).toEqual(["-- 選択解除 --", "東京", "大阪", "京都"]);
  });

  test("filters options by searchText, falling back to the label", () => {
    const { input, shownOptions } = setup();
    fireEvent.click(input);

    fireEvent.change(input, { target: { value: "おおさか" } });
    expect(shownOptions()).toEqual(["大阪"]);

    fireEvent.change(input, { target: { value: "京" } });
    expect(shownOptions()).toEqual(["京都"]);
  });

  test("selects an option by clicking it and closes", () => {
    const { input, onSelect, shownOptions, getByText } = setup();
    fireEvent.click(input);

    fireEvent.click(getByText("東京"));

    expect(onSelect).toHaveBeenCalledWith("tokyo");
    expect(shownOptions()).toEqual([]);
    expect(input.value).toBe("東京");
  });

  test("selects an option with the arrow keys and Enter", () => {
    const { input, onSelect, key } = setup();
    fireEvent.click(input);

    key("ArrowDown"); // -- 選択解除 --
    key("ArrowDown"); // 東京
    key("ArrowDown"); // 大阪
    key("ArrowUp"); // 東京
    key("Enter");

    expect(onSelect).toHaveBeenCalledWith("tokyo");
  });

  test("the empty option can be chosen with Enter", () => {
    const { input, onSelect, key } = setup("tokyo");
    fireEvent.click(input);

    key("ArrowDown");
    key("Enter");

    expect(onSelect).toHaveBeenCalledWith("");
  });

  test("Escape and clicking outside close the options", () => {
    const { input, shownOptions, key, getByTestId } = setup();

    fireEvent.click(input);
    key("Escape");
    expect(shownOptions()).toEqual([]);

    fireEvent.click(input);
    fireEvent.mouseDown(getByTestId("outside"));
    expect(shownOptions()).toEqual([]);
  });
});
